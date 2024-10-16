import styles from './SearchResultsList.module.scss';
import SearchResult from '../SearchResult/SearchResult.tsx';
import { useEffect, useState } from 'react';

export default function SearchResultsList({ results }: { results: SearchResult[] }) {

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleClickOutside = () => {
            setIsVisible(false); // Hide the list when the user clicks anywhere
        };

        // Attach the event listener to detect clicks anywhere in the document
        document.addEventListener('click', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className={results.length === 0 || !isVisible ? styles.hidden : styles.resultsList}>
            {results.map((result, id) => (
                <SearchResult result={result} key={id} />
            ))}
        </div>
    );
}
