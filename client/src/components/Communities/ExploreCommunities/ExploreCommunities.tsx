import styles from "./ExploreCommunities.module.scss";
import Search from "../Search/Search.tsx";
import Category from "../Category/Category.tsx";
import {useEffect, useState} from "react";
import {getTags} from "../../../api.ts";

export default function ExploreCommunities() {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        getTags().then((res) => {
            setTags(res.data);
        })
    }, []);

    return (
        <div className={styles.container}>
            <Search />
            {tags.map((tag: {id: number, name: string}) => (
                <Category key={tag.id} tag={tag.name} />
            ))}
        </div>
    );
}
