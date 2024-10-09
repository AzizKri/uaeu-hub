import styles from './SearchResultsList.module.scss';
import SearchResult from "../SearchResult/SearchResult.tsx";

export default function SearchResultsList({results } :  ResList ){
    return (
        <div className={styles.resultsList}>
            {results.map((result, id) => (
                <SearchResult result={result.title} key={id} />
            ))}
        </div>
    );
}