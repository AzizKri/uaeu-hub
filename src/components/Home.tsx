import Question from "./Question.tsx";

export default function Home() {
    return (
        <>
            <div>
                <h3>Home</h3>
                <span>What's your question?</span>
                <button>Submit</button>
            </div>
            <h3>Recent Questions</h3>
            <span>20 new questions</span>

            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
        </>
    )
}