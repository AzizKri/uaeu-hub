import styles from "./SearchUsers.module.scss";
import React, { useCallback, useState } from "react";
import { debounce } from "../../../utils/tools.ts";
import { searchUsersWithStatusInCommunity } from "../../../api/users.ts";
import searchIcon from "../../../assets/search.svg";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";
import UserPreview from "../../UserPreview/UserPreview.tsx";

export default function SearchUsers({ communityId }: { communityId: number }) {
    const [results, setResults] = useState<UserInfo[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const getResults = useCallback(
            debounce(async (searchValue: string) => {
                searchUsersWithStatusInCommunity(searchValue, communityId).then(
                    (res) => {
                        console.log("search res", res.data);
                        setLoading(false);
                        setResults(
                            res.data.map(
                                (user: {
                                    id: number;
                                    username: string;
                                    displayname: string;
                                    pfp: string;
                                    status:
                                        | "member"
                                        | "invited"
                                        | "not_invited";
                                }) => ({
                                    id: user.id,
                                    username: user.username,
                                    displayName: user.displayname,
                                    pfp: user.pfp,
                                    status: user.status,
                                }),
                            ),
                        );
                    },
                );
            }, 500),
        [searchValue, communityId],
    );

    const handleSelect = (userId: number) => {
        // navigate(`/community/${communityName}`);
        console.log("invite user with id: ", userId);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const val = e.target.value;
        setSearchValue(val);
        if (val.length === 0) {
            setResults([]);
        } else {
            setLoading(true);
            getResults(val);
        }
    };

    return (
        <div className={styles.container}>
            <div
                className={styles.searchWrapper}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={searchIcon}
                    alt="search icon"
                    className={styles.searchIcon}
                />
                <input
                    placeholder="Search Users..."
                    value={searchValue}
                    onChange={handleChange}
                    className={styles.searchInput}
                />
            </div>
            <ul className={styles.communities}>
                {loading ? (
                    <LineSpinner spinnerRadius="24px" />
                ) : results.length > 0 ? (
                    results.map((user: UserInfo) => (
                        <li
                            key={user.id}
                            className={styles.communityListItem}
                            onClick={() => handleSelect(user.id!)}
                        >
                            <UserPreview
                                communityId={communityId}
                                profileUser={user}
                                type="SEARCH-USERS"
                                userStatus={user.status || "NOT-INVITED"}
                                myRole="Administrator"
                            />
                        </li>
                    ))
                ) : (
                    <p className={styles.noCommunityMessage}>No match.</p>
                )}
            </ul>
        </div>
    );
}
