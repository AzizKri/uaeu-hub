import styles from './SearchResult.module.scss'
export default function SearchResult({ result }){
    return (
        <div className={styles.searchResult}>{result}</div>
    );
}