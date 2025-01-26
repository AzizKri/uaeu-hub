import styles from "./Search.module.scss";
import React, { useCallback, useState } from "react";
import SearchResultsList from "../SearchResultsList/SearchResultsList.tsx";
import { searchPosts } from "../../../api/posts.ts";
import { debounce } from "../../../utils/tools.ts";

export default function Search() {
    const [input, setInput] = useState<string>("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [loadingResults, setLoadingResults] = useState<boolean>(false);

    const fetchData = useCallback(
        debounce(async (searchValue: string) => {
            searchPosts(searchValue).then((res) => {
                setLoadingResults(false);
                setResults(res.data);
            });
        }, 1000),
        [],
    );

    const handleChange = (value: string) => {
        setInput(value);
        setLoadingResults(true);
        fetchData(value);
    };

    const handleClickSearchIcon = () => {
        const search = document.getElementById("navbarSearch");
        if (search && !search.classList.contains(styles.active)) {
            search.classList.add(styles.active);
        }
        const searchElement = document.getElementById("search");
        if (searchElement) searchElement.focus();
    };

    const handleClickNB: React.MouseEventHandler<HTMLDivElement> = (e) => {
        const target = e.currentTarget;
        if (target && !target.classList.contains(styles.active)) {
            target.classList.add(styles.active);
        }
    };

    const handleBack: React.MouseEventHandler<HTMLSpanElement> = (e) => {
        e.stopPropagation();
        const search = document.getElementById("navbarSearch");
        if (search && search.classList.contains(styles.active)) {
            search.classList.remove(styles.active);
        }
    };

    const clearInput = () => {
        setInput("");
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
            <div
                id="navbarSearch"
                className={styles.navbarSearch}
                onClick={handleClickNB}
            >
                <span className={styles.back} onClick={handleBack}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>chevron-left</title>
                        <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                    </svg>
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    fill="#00000"
                    onClick={handleClickSearchIcon}
                >
                    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                </svg>
                <input
                    id="search"
                    title="search"
                    placeholder="Search..."
                    className={styles.navbarSearchInput}
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={handleFocus}
                />
                <div className={styles.results}>
                    {showResults && (
                        <ul className={styles.communities}>
                            <SearchResultsList
                                results={results}
                                clearInput={clearInput}
                                loading={loadingResults}
                            />
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
