import styles from './SearchResult.module.scss';
import {Link} from "react-router-dom";

export default function SearchResult({ result }: {result: SearchResult}) {
    return (
        <Link to={`/post/${result.id}`} className={styles.postSearchLink}>
            <div className={styles.searchResult}>{result.content}</div>
        </Link>
    );
}
