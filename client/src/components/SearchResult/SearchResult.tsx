import styles from './SearchResult.module.scss'
// @ts-ignore
export default function SearchResult({ result }) {
    return (
        <a href={`/post/${result.id}`}><div className={styles.searchResult}>{result.content}</div></a>
    );
}