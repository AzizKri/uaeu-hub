import styles from "./ShareModal.module.scss"
import facebookLogo from "../../../assets/logos/Facebook_Logo_Primary.png";
import xLogo from "../../../assets/logos/X-Logo.svg";
import instagramLogo from "../../../assets/logos/Instagram_Glyph_Gradient.png";
import whatsappLogo from "../../../assets/logos/Digital_Glyph_Green.svg";

export default function ShareModal({id}: {id: number}) {

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://www.uaeu.chat/post/${id}`).then(() => {

        })
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Share Post</h3>
            <ul className={styles.links}>
                <li className={`${styles.link} ${styles.facebook}`}>
                    <a href={`https://www.facebook.com/sharer.php?u=https%3A%2F%2Fuaeu.chat%2Fpost%2F${id}`} target="_blank">
                        <img src={facebookLogo} alt="share to facebook"/>
                    </a>
                </li>
                <li className={`${styles.link} ${styles.x}`}>
                    <a href={`https://x.com/intent/tweet?url=https%3A%2F%2Fuaeu.chat%2Fpost%2F${id}`} target="_blank">
                        <img src={xLogo} alt="share to X"/>
                    </a>
                </li>
                <li className={`${styles.link} ${styles.instagram}`}>
                    <a href={""} target="_blank">
                        <img src={instagramLogo} alt="share to instagram"/>
                    </a>
                </li>
                <li className={`${styles.link} ${styles.whatsapp}`}>
                    <a href={`https://api.whatsapp.com/send?text=https%3A%2F%2Fuaeu.chat%2Fpost%2F${id}`} data-action="share/whatsapp/share" target="_blank">
                        <img src={whatsappLogo} alt="share to whatsapp"/>
                    </a>
                </li>
            </ul>
            <div className={styles.linkPreview} >
                <span className={styles.postLink}>{`https://uaeu.chat/post/${id}`}</span>
                <button className={styles.copyButton} onClick={handleCopy}>Copy</button>
            </div>
        </div>
    )
}
