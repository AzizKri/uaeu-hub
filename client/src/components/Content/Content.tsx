import styles from "./Content.module.scss"
import LoadingImage from "../LoadingImage/LoadingImage.tsx";
import React, {useEffect, useState} from "react";
import {getAttachmentDetails} from "../../api.ts";
import {useNavigate} from "react-router-dom";

export default function Content({id, content, filename, type}: {
    id: number,
    content: string,
    filename: string | undefined,
    type: string
}) {
    const [showContent, setShowContent] = useState<boolean>(content.length < 300);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [imageDims, setImageDims] = useState<{ width: number, height: number }>({width: 0, height: 0});
    const [error, setError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(filename != null);
    const navigate = useNavigate();

    useEffect(() => {
        if (filename) {
            getAttachmentDetails(filename).then((res) => {
                if (res.status === 200) {
                    const fileType = res.data?.type;
                    if (fileType?.startsWith('image')) {
                        setImageDims({width: res.data?.metadata.width, height: res.data?.metadata.height});
                        setImageSrc(`https://cdn.uaeu.chat/attachments/${filename}`);
                        setError(false);
                    } else {
                        setImageSrc(`https://cdn.uaeu.chat/attachments/${filename}`);
                        setError(false);
                    }
                } else {
                    setError(true);
                    setIsLoading(false);
                }
            }).catch(() => {
                setError(true);
                setIsLoading(false);
            });
        }
    }, [filename]);

    const handleShowMore: React.MouseEventHandler<HTMLSpanElement> = (e) => {
        e.stopPropagation();
        setShowContent(true)
    }

    const handleClickOnPost: React.MouseEventHandler<HTMLDivElement> = () => {
        if (type === 'post') {
            navigate(`/post/${id}`);
        }
    }

    return (
        <>
            <div className={styles.text} onClick={handleClickOnPost}
                 style={{cursor: type === 'post' ? 'pointer' : 'default'}}>
                {showContent || type === "post-page" ? (
                    content
                ) : (
                    <>
                        {content.slice(0, 200)}
                        <span>&#8230;</span>
                    </>
                )}
                {!showContent && <span className={styles.show_more} onClick={handleShowMore}>show more</span>}
            </div>
            {/*<ReadOnlyEditor content={editorContent} />*/}
            {isLoading && !error && <LoadingImage/>}
            {filename != null && !error && <div className={styles.image}
                                                style={{
                                                    display: isLoading ? 'none' : 'block',
                                                    height: imageDims.height,
                                                    width: imageDims.width
                                                }}
            >
                <img
                    src={imageSrc}
                    alt="post attachment"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setError(true);
                        setIsLoading(false);
                    }}
                />
            </div>}
            {error && <p>Error Loading the image</p>}
        </>
    )
}
