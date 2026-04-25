import { useLocalSearchParams } from 'expo-router';
import { useState,useEffect } from 'react';
type Post = {
    id: number;
    title: string;
    body: string;
}
export default function Page() {
    const [data, setData] = useState<Post>({ id: 0, title: '', body: '' });
    const { id } = useLocalSearchParams<{ id: string }>();
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
            const data = await response.json();
            setData(data);
        };
        fetchData();
    }, [id]);
    return (
        <div>
            <h1>Page {id}</h1>
            <p>{data.title}</p>
            <p>{data.body}</p>
        </div>
    );
}