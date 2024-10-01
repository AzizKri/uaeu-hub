import "../styles/post.scss"
import profilePicture from "../assets/profile-picture.png"
import postImage from "../assets/post-image.png"
import PostFooter from "./Question/PostFooter.tsx";
import Comment from "./Comment.tsx";

export default function Post() {
    return (
        <div className="post">
            <div className="post__wrapper">
                <div className="post__header">
                    <button className="post__header__btn-back">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 400 800" width="11.78px"
                             fill="#5f6368">
                            <path d="M400 0L0 400l400 400 71-71-329-329 329-329L400 0Z"/>
                        </svg>
                    </button>
                    <span className="post__header__title">Post</span>
                    <button className="post__header_btn-options">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                             fill="#5f6368">
                            <path
                                d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="post__info-bar">
                <div className="post__info-bar__profile-pict">
                     <img src={profilePicture}  alt="profile picture"/>
                 </div>
                <div className="post__info-bar__name">
                    <div className="post__info-bar__name__display-name">Display Name</div>
                    <div className="post__info-bar__name__user-name">@username</div>
                </div>
                <span>•</span>
                <div className="post__info-bar__time">3hr.ago</div>
            </div>
            <div className="post__content">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium corporis culpa libero, necessitatibus odio quaerat reiciendis! Alias magnam obcaecati voluptatibus.
            </div>
            <div className="post__image">
                <img src={postImage} alt="profile picture"/>
            </div>
            <PostFooter />
            {/* TODO use spacy instead of an input */}
            <div className="post__write-answer">
                <input className="post__write-answer__input" type="text" placeholder="Write your answer" />
                <button className="post__write-answer__post btn-hover">Post</button>
            </div>
            <Comment />
        </div>
    )
}