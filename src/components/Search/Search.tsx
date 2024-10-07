import styles from './Search.module.scss'
import {useState} from "react";
import SearchResultsList from "../SearchResultsList/SearchResultsList.tsx";

export default function Search() {
    const [input, setInput] = useState<string>("");
    const [results, setResults] = useState<Res[]>([]);

    const fetchData = (value: string)=>{
        fetch("https://jsonplaceholder.typicode.com/posts")
            .then((response) => response.json())
            .then((json) => {
                const results = json.filter((post: Res) => {
                    return value && post && post.title && post.title.toLowerCase().includes(value.toLowerCase())
                });
                setResults(results);
            });
        console.log(results)
    }

    const handleChange = (value:string) =>{
        setInput(value);
        fetchData(value)

    }
    return (
    <>
      <div className={styles.navbarSearch}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#00000"
        >
          <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
        </svg>
        <input title="search" placeholder="Search.." className={styles.navbarSearchInput} value={input} onChange={(e) => handleChange(e.target.value)}/>
          {results.length > 0 && <SearchResultsList results={results}/>}
      </div>
    </>
  );
}
