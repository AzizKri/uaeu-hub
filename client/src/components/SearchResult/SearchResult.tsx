import styles from './SearchResult.module.scss'
export default function SearchResult({ result } : {result: PostInfo}) {
    return (
        <a href={`/post/${result.id}`}><div className={styles.searchResult}>{result.content}</div></a>
    );
}