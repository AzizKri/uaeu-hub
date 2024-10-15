import styles from './SearchResult.module.scss';

// @ts-expect-error Binding element 'result' has type 'any', we'll fix it later™
export default function SearchResult({ result }) {
    return (
        <a href={`/post/${result.id}`}>
            <div className={styles.searchResult}>{result.content}</div>
        </a>
    );
}
