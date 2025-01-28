import styles from "./ExploreCommunities.module.scss";
import Search from "../Search/Search.tsx";
import Category from "../Category/Category.tsx";
import {useEffect, useState} from "react";
import {getTags} from "../../../api/tags.ts";
import CreateCommunity from "../CreateCommunity/CreateCommunity.tsx";
import UnAuthorizedPopUp from "../../Reusable/UnAuthorizedPopUp/UnAuthorizedPopUp.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";

export default function ExploreCommunities() {
    const [tags, setTags] = useState([]);
    const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
    const [showUnAuthModal, setShowUnAuthModal] = useState(false);
    const [joinedCommunity, setJoinedCommunity] = useState<number>(-1);
    const {isUser} = useUser();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true)
        getTags().then((res) => {
            setTags(res.data);
        })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return isLoading ? (<LineSpinner width={"200px"} />) : (
        <div className={styles.container}>
            <div className={styles.header}>
                <Search/>
                <div
                    className="btn-outline"
                    onClick={() => isUser() ? setShowCreateCommunityModal(true) : setShowUnAuthModal(true)}
                >
                    {/*plus icon*/}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="5 5 14 14"
                        fill="currentColor"
                        width="12"
                        height="12"
                    >
                        <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                    <span>Create</span>
                </div>
            </div>
            {tags.map((tag: { id: number, name: string }) => (
                <Category key={tag.id} tag={tag.name} joinedCommunity={joinedCommunity} setJoinedCommunity={setJoinedCommunity} />
            ))}
            {showCreateCommunityModal && (
                <CreateCommunity type="CREATE" onClose={() => setShowCreateCommunityModal(false)}/>
            )}
            {showUnAuthModal && <UnAuthorizedPopUp hidePopUp={() => setShowUnAuthModal(false)}/>}
        </div>
    );
}
