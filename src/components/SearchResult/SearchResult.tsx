import styles from './SearchResult.module.scss'
export default function SearchResult({ result } : {result : string}){
    return (
        <div className={styles.searchResult}>{result}</div>
    );
}