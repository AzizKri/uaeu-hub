import styles from "./Editor.module.scss";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {$createParagraphNode, $createTextNode, $getRoot} from "lexical";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { comment } from "../../../api/comments.ts"
import { createPost } from "../../../api/posts.ts";
import {deleteAttachment, uploadAttachment} from "../../../api/attachmets.ts";
import {getCommunitiesCurrentUser} from "../../../api/currentUser.ts";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import ThreeDotsLine from "../../Reusable/Animations/ThreeDotsLine/ThreeDotsLine.tsx";
import Post from "../Post/Post.tsx";
import arrowDownIcon from "../../../assets/chevron-down.svg";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";
import {subComment} from "../../../api/subComments.ts";
import PostImage from "../../Reusable/PostImage/PostImage.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";
import CommunityIconComponent from "../../Reusable/CommunityIconComponent/CommunityIconComponent.tsx";
import { auth, signInAnonymously } from "../../../firebase/config.ts";
import SuspendedPopUp from "../../Reusable/SuspendedPopUp/SuspendedPopUp.tsx";

interface UploadState {
    status: "IDLE" | "UPLOADING" | "COMPLETED" | "ERROR";
    fileName?: string;
    file: File | null;
    preview: string | ArrayBuffer | null;
}

interface EditorProps {
    type: "POST" | "COMMENT" | "SUB-COMMENT";
    parentId?: number;
    initialText?: string;
    autoFocus?: boolean;
    handleSubmit?: (() => void);
    prependPost?: (stuff: React.ReactElement) => void;
    prependComment?: (stuff: CommentInfo) => void;
    communityId?: number;
}

function prepareInitialState(initialText: string) {
    return () => {
        const root = $getRoot();
        if (root.getFirstChild() === null && initialText) {
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(initialText));
            root.append(paragraph);
        }
    }
}

function AutoFocusPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.focus();
    }, [editor]);

    return null;
}

export default function Editor({
    type,
    parentId,
    initialText = '',
    prependPost,
    prependComment,
    communityId,
    autoFocus = false,
}: EditorProps ): JSX.Element {
    const [plainText, setPlainText] = useState<string>("");
    const [uploadState, setUploadState] = useState<UploadState>({
        status: "IDLE",
        file: null,
        preview: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allCommunities, setAllCommunities] = useState<CommunityINI[]>([]);
    const [displayedCommunities, setDisplayedCommunities] = useState<
        CommunityINI[]
    >([]);
    const [showCommunities, setShowCommunities] = useState<boolean>(false);
    const [selectedCommunity, setSelectedCommunity] = useState<CommunityINI>();
    const [loadingUserCommunities, setLoadingUserCommunities] =
        useState<boolean>(false);
    const selectCommunityButtonRef = useRef<HTMLButtonElement>(null);
    const selectCommunityInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const editorHelperRef = useRef<{ clearEditorContent: () => void }>(null);
    const { user, isUser, isSuspended } = useUser();
    const [showSuspendedPopUp, setShowSuspendedPopUp] = useState<boolean>(false);


    const initialConfig = {
        namespace: "MyEditor",
        theme: {},
        editorState: initialText ? prepareInitialState(initialText + " ") : undefined,
        onError: (error: Error) => {
            console.error(error);
        },
    };

    useEffect(() => {
        const hasContent = !!(uploadState.file || plainText);
        editorContainerRef.current?.classList.toggle(
            styles.focused,
            hasContent,
        );
    }, [uploadState.file, plainText]);

    const EditorHelper = forwardRef((_props, ref) => {
        const [editor] = useLexicalComposerContext();

        useEffect(() => {
            if (initialText) {
                editor.update(() => {
                    const root = $getRoot();
                    if (root.getFirstChild() === null) {
                        const paragraph = $createParagraphNode();
                        paragraph.append($createTextNode(initialText));
                        root.append(paragraph);
                    }
                });
            }

            const updatePlainText = () => {
                editor.update(() => {
                    const root = $getRoot();
                    setPlainText(root.getTextContent());
                });
            };

            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(updatePlainText);
            });
        }, [editor]);

        useImperativeHandle(ref, () => ({
            clearEditorContent: () => {
                editor.update(() => {
                    const root = $getRoot();
                    const paragraph = $createParagraphNode();
                    root.clear();
                    root.append(paragraph);
                    paragraph.select();
                });
            },
        }));

        return null;
    });

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        try {
            setUploadState({
                status: "UPLOADING",
                file: selectedFile,
                preview: null,
            });

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadState((prev) => ({
                    ...prev,
                    preview: e.target?.result || null,
                }));
            };
            reader.readAsDataURL(selectedFile);

            // Upload file
            const response = await uploadAttachment([selectedFile]);

            if (response.status === 201) {
                setUploadState((prev) => ({
                    ...prev,
                    status: "COMPLETED",
                    fileName: response.filename,
                }));
            } else {
                throw new Error(
                    `Upload failed with status: ${response.status}`,
                );
            }
        } catch (error) {
            console.error("File upload error:", error);
            setUploadState({
                status: "ERROR",
                file: null,
                preview: null,
            });
        }
    };

    const removeImage = () => {
        if (typeof uploadState.fileName === "string")
            deleteAttachment(uploadState.fileName).then(() =>
                console.log("attachment deleted"),
            );
        setUploadState({
            status: "IDLE",
            file: null,
            preview: null,
        });
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const submitPost = async () => {
        console.log(`submitPost: type is ${type}, parent id is ${parentId}`);
        if (isSubmitting || plainText.length === 0) {
            console.log("either is submitting or plainText.length is equal to 0");
            return;
        }

        // Check if user is suspended
        if (isSuspended()) {
            setShowSuspendedPopUp(true);
            return;
        }

        try {
            setIsSubmitting(true);

            // Check if we're still uploading a file
            if (uploadState.status === "UPLOADING") {
                throw new Error("Please wait for file upload to complete");
            }

            // If user is not logged in, sign them in anonymously first
            // This ensures anonymous content can be transferred when they sign up later
            if (!user && !auth.currentUser) {
                console.log("No user, signing in anonymously...");
                const userCredential = await signInAnonymously(auth);
                console.log("Signed in anonymously:", userCredential.user.uid);
            }

            if (type === "POST") {
                console.log("type is post");
                let post;
                if (communityId !== undefined) {
                    console.log("there is a community id");
                    post = await createPost(plainText, uploadState.fileName, communityId);
                } else if (!user || user.isAnonymous || user.new) {
                    post = await createPost(plainText, uploadState.fileName);
                } else if (!selectedCommunity) {
                    selectCommunityButtonRef.current?.classList.add(
                        styles.warning,
                    );
                    return;
                } else {
                    post = await createPost(
                        plainText,
                        uploadState.fileName,
                        selectedCommunity.id,
                    );
                }
                const postInfo: PostInfo = {
                    id: post.id,
                    publicId: post.public_id,
                    content: post.content,
                    authorUsername: post.author,
                    authorDisplayName: post.displayname,
                    pfp: post.pfp,
                    postDate: new Date(post.post_time),
                    filename: post.attachment,
                    attachmentMime: post.attachment_mime,
                    likeCount: post.like_count,
                    commentCount: post.comment_count,
                    type: "POST",
                    liked: post.like,
                };

                const communityInfo: CommunityInfoSimple = {
                    name: post.community,
                    icon: post.community_icon,
                };

                if (prependPost) {
                    prependPost(
                        <Post
                            key={post.id}
                            postInfo={postInfo}
                            communityInfo={communityInfo}
                        />,
                    );
                }

                setUploadState({
                    status: "IDLE",
                    file: null,
                    preview: null,
                });
            } else if (type === "COMMENT"  && parentId) {
                const res = await comment(
                    parentId,
                    plainText,
                    uploadState.fileName,
                );
                console.log("comment result", res);
                const createdComment: CommentInfo = {
                    attachment: res.attachment,
                    author: res.author,
                    authorId: res.author_id,
                    content: res.content,
                    displayName: res.displayname,
                    id: res.id,
                    likeCount: res.like_count,
                    commentCount: res.comment_count,
                    liked: res.liked,
                    parentId: res.parent_comment_id,
                    pfp: res.pfp,
                    postTime: new Date(res.post_time),
                };
                if (prependComment) prependComment(createdComment);
            } else if (type === "SUB-COMMENT" && parentId) {
                const res = await subComment(parentId, plainText, uploadState.fileName);
                console.log("subComment res", res);
                const createdSubComment: CommentInfo = {
                    attachment: res.data.attachment,
                    author: res.data.author,
                    authorId: res.data.author_id,
                    content: res.data.content,
                    displayName: res.data.displayname,
                    id: res.data.id,
                    likeCount: res.data.like_count,
                    commentCount: res.data.comment_count,
                    liked: res.data.liked,
                    parentId: res.data.parent_comment_id,
                    pfp: res.data.pfp,
                    postTime: new Date(res.data.post_time),
                };

                if (prependComment) prependComment(createdSubComment);
            }

            // Reset the editor
            if (editorHelperRef.current) {
                editorHelperRef.current.clearEditorContent();
                // editorHelperRef.current.s
            }
        } catch (error) {
            console.error("Error submitting post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeImage = () => {
        if (typeof uploadState.fileName === "string")
            deleteAttachment(uploadState.fileName).then(() =>
                console.log("attachment deleted"),
            );
        imageInputRef.current?.click();
    };

    const handleSelect = (e: React.MouseEvent, community: CommunityINI) => {
        e.stopPropagation();
        setSelectedCommunity(community);
        console.log("selected community is: ", community);
        setShowCommunities(false);
    };

    useEffect(() => {
        if (showCommunities) selectCommunityInputRef?.current?.focus();
    }, [showCommunities]);

    const handleSelectCommunityClick: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        setShowCommunities(true);
        if (allCommunities.length === 0) {
            setLoadingUserCommunities(true);
            getCommunitiesCurrentUser().then(
                (res: { status: number; data: CommunityINI[] }) => {
                    console.log("communities", res.data);
                    setAllCommunities(res.data);
                    setDisplayedCommunities(res.data);
                    setLoadingUserCommunities(false);
                },
            );
        }
        const listener = () => {
            setShowCommunities(false);
            document.body.removeEventListener("click", listener);
        };

        document.body.addEventListener("click", listener);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayedCommunities(
            allCommunities.filter((com) =>
                com.name.toLowerCase().includes(e.target.value.toLowerCase()),
            ),
        );
    };

    return (
        <div className={styles.container}>
            {showSuspendedPopUp && (
                <SuspendedPopUp hidePopUp={() => setShowSuspendedPopUp(false)} />
            )}
            <div ref={editorContainerRef} className={styles.editorContainer}>
                <LexicalComposer initialConfig={initialConfig}>
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className={styles.editorInput}/>
                        }
                        placeholder={
                            <div className={styles.editorPlaceholder}>
                                {type === "POST"
                                    ? "What's your question?"
                                    : "Reply..."
                                }
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <EditorHelper ref={editorHelperRef}/>
                    <HistoryPlugin/>
                    {autoFocus && <AutoFocusPlugin/>}
                </LexicalComposer>

                {uploadState.file && (
                    <div className={uploadState.file.type === 'application/pdf' ? styles.pdfPreview : styles.imagePreview}>
                        {uploadState.file.type === 'application/pdf' ? (
                            // PDF Preview Card
                            <div className={styles.pdfCard}>
                                <div className={styles.pdfIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.9,12.35 10.92,12.31Z"/>
                                    </svg>
                                </div>
                                <div className={styles.pdfInfo}>
                                    <span className={styles.pdfName}>{uploadState.file.name}</span>
                                    <span className={styles.pdfSize}>
                                        {(uploadState.file.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                                {uploadState.status === "UPLOADING" && (
                                    <div className={styles.pdfLoading}>
                                        <LineSpinner spinnerRadius="20px" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Image Preview
                            typeof uploadState.preview === "string" && (
                                <PostImage
                                    source={uploadState.preview}
                                    alt={"uploaded image preview"}
                                    onError={() => null}
                                    onLoad={() => null}
                                    isLoading={uploadState.status === "UPLOADING"}
                                />
                            )
                        )}
                        <div
                            className={styles.changeImage}
                            onClick={handleChangeImage}
                        >
                            change
                        </div>
                        <div className={styles.cancelImage} onClick={removeImage}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                width="20"
                                height="20"
                            >
                                <path
                                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                            </svg>
                        </div>
                    </div>
                )}

            </div>
            <div className={styles.buttons}>
                {isUser() && type === "POST" && communityId === undefined && (
                    <div className={styles.selectCommunity}>
                        {showCommunities ? (
                            <>
                                <input
                                    type="text"
                                    onChange={handleSearch}
                                    placeholder="select"
                                    className={styles.input}
                                    onClick={(e) => e.stopPropagation()}
                                    ref={selectCommunityInputRef}
                                />
                                <ul className={styles.communities}>
                                    {loadingUserCommunities ? (
                                        <LineSpinner spinnerRadius="24px"/>
                                    ) : displayedCommunities.length > 0 ? (
                                        displayedCommunities.map(
                                            (community: CommunityINI) => (
                                                <li
                                                    key={community.name}
                                                    className={
                                                        styles.communityListItem
                                                    }
                                                    onClick={(e) =>
                                                        handleSelect(e, community)
                                                    }
                                                >
                                                    <CommunityPreview
                                                        community={community}
                                                    />
                                                </li>
                                            ),
                                        )
                                    ) : (
                                        <p
                                            className={
                                                styles.noCommunityMessage
                                            }
                                        >
                                            You are not a member in any
                                            community
                                            <br/>
                                            Please join at least one community
                                            to be able to post
                                        </p>
                                    )}
                                </ul>
                            </>
                        ) : (
                            <button
                                className={styles.showCommunities}
                                onClick={handleSelectCommunityClick}
                                ref={selectCommunityButtonRef}
                            >
                                {selectedCommunity ? (
                                    <CommunityPreview
                                        community={selectedCommunity}
                                    />
                                ) : (
                                    <span>Select a community</span>
                                )}
                                <img
                                    src={arrowDownIcon}
                                    alt="arrow down icon"
                                />
                            </button>
                        )}
                    </div>
                )}
                <div
                    className={styles.buttonIcon}
                    onClick={() => imageInputRef.current?.click()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -960 960 960"
                        fill="currentColor"
                    >
                        <path
                            d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"/>
                    </svg>
                </div>
                <input
                    ref={imageInputRef}
                    className={styles.postImageInput}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                />
                <div className={styles.buttonIcon} onClick={submitPost}>
                    {isSubmitting || uploadState.status === "UPLOADING" ? (
                        <ThreeDotsLine/>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                        >
                            <path
                                d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}

export function CommunityPreview({community}: { community: CommunityInfoSimple }) {
    return (
        <div className={styles.community}>
            <div style={{ width: "32px", height: "32px" }}>
            <CommunityIconComponent source={community.icon} />
            </div>
            <span className={styles.communityName}>{community.name}</span>
        </div>
    );
}
