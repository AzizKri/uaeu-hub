import styles from './SearchResult.module.scss'
// @ts-ignore
export default function SearchResult({ result }) {
    return (
        <div className={styles.searchResult}>{result.content}</div>
    );
}