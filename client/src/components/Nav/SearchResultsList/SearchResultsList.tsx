import styles from "./SearchResultsList.module.scss";
import SearchResult from "../SearchResult/SearchResult.tsx";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";

export default function SearchResultsList({
    results,
    clearInput,
    loading,
}: {
    results: SearchResult[];
    clearInput: () => void;
    loading: boolean;
}) {

    return (
        <div className={styles.resultsList} onClick={clearInput}>
            {loading ? (
                <LineSpinner width="24px" />
            ) : results && results.length !== 0 ? (
                results.map((result, id) => (
                    <SearchResult result={result} key={id} />
                ))
            ) : (
                <p className={styles.noCommunityMessage}>No match.</p>
            )}
        </div>
    );
}
