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
import communityIcon from "../../../assets/community-icon.jpg";
import arrowDownIcon from "../../../assets/chevron-down.svg";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";
import {subComment} from "../../../api/subComments.ts";
import PostImage from "../../Reusable/PostImage/PostImage.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";

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
    const { user, isUser } = useUser();


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

        try {
            setIsSubmitting(true);

            // Check if we're still uploading a file
            if (uploadState.status === "UPLOADING") {
                throw new Error("Please wait for file upload to complete");
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
                    content: post.content,
                    authorUsername: post.author,
                    authorDisplayName: post.displayname,
                    pfp: post.pfp,
                    postDate: new Date(post.post_time),
                    filename: post.attachment,
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

                {uploadState.preview && (
                    <div className={styles.imagePreview}>
                        {typeof uploadState.preview === "string" && (
                            <PostImage
                                source={uploadState.preview}
                                alt={"uploaded image preview"}
                                onError={() => null}
                                onLoad={() => null}
                                isLoading={uploadState.status === "UPLOADING"}
                            />
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
                            d="M480-480ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-320h80v320q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/>
                    </svg>
                </div>
                <input
                    ref={imageInputRef}
                    className={styles.postImageInput}
                    type="file"
                    accept="image/*"
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
            <img
                src={community.icon || communityIcon}
                alt={community.name}
                className={styles.icon}
            />
            <span className={styles.communityName}>{community.name}</span>
        </div>
    );
}
