import styles from "./Search.module.scss";
import searchIcon from "../../../assets/search.svg";
import React, { useCallback, useState } from "react";
import { debounce } from "../../../utils/tools.ts";
import { searchCommunities } from "../../../api/communities.ts";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";
import { CommunityPreview } from "../../PostStuff/Editor/Editor.tsx";
import { useNavigate } from "react-router-dom";

export default function Search() {
    const [results, setResults] = useState<CommunityINI[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [loadingUserCommunities, setLoadingUserCommunities] =
        useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const navigate = useNavigate();

    const getResults = useCallback(
        debounce(async (searchValue: string) => {
            searchCommunities(searchValue).then((res) => {
                setLoadingUserCommunities(false);
                setResults(res.data);
            });
        }, 1000),
        [],
    );

    const handleSelect = (communityName: string) => {
        navigate(`/community/${communityName}`);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const val = e.target.value;
        setSearchValue(val);
        if (val.length > 0) {
            setLoadingUserCommunities(true);
            getResults(val);
        }
    };

    const handleFocus = () => {
        const listener = () => {
            setShowResults(false);
            document.body.removeEventListener("click", listener);
        };
        setShowResults(true);
        document.body.addEventListener("click", listener);
    };

    return (
        <>
            <div className={styles.container}>
                <img src={searchIcon} alt="search icon" />
                <input
                    placeholder="Search Communities..."
                    value={searchValue}
                    onFocus={handleFocus}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleChange}
                />
                {showResults && (
                    <ul className={styles.communities}>
                        {loadingUserCommunities ? (
                            <LineSpinner spinnerRadius="24px" />
                        ) : results.length > 0 ? (
                            results.map((community: CommunityINI) => (
                                <li
                                    key={community.name}
                                    className={styles.communityListItem}
                                    onClick={() => handleSelect(community.name)}
                                >
                                    <CommunityPreview community={community} />
                                </li>
                            ))
                        ) : (
                            <p className={styles.noCommunityMessage}>
                                No match.
                            </p>
                        )}
                    </ul>
                )}
            </div>
        </>
    );
}
