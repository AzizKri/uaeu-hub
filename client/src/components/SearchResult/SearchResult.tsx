import styles from './SearchResult.module.scss';

export default function SearchResult({ result }: {result: SearchResult}) {
    return (
        <a href={`/post/${result.id}`} className={styles.postSearchLink}>
            <div className={styles.searchResult}>{result.content}</div>
        </a>
    );
}
