import { PureComponent } from "preact/compat";
import { Header } from "../components/header";
import { Post } from "../components/post";
// @ts-ignore no types
import { Plock } from "react-plock";
import { UserData } from "../data/user";
import { PostData } from "../data/post";

type State = {
    columns: number;
};

export class Home extends PureComponent<any, State> {
    constructor() {
        super();
        this.state = {
            columns: this.settingColumns(),
        };
    }

    // TODO: Factor in the amount of images
    // If we have less than the result then only use the number of images as columns
    private settingColumns(): number {
        if (window.innerWidth >= 1400) {
            return 4;
        } else if (window.innerWidth >= 800) {
            return 3;
        } else if (window.innerWidth >= 500) {
            return 2;
        } else {
            return 1;
        }
    }

    componentDidMount() {
        window.addEventListener('resize', () => this.setState({ columns: this.settingColumns() }));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.setState({ columns: this.settingColumns() }));
    }

    render() {
        return (
            <div class="flex flex-col">
                <header>
                    <Header />
                </header>
                <main class="m-12 mt-6">
                    <h1 class="text-3xl font-bold mb-4 text-white">Explore</h1>
                    <div class="flex justify-center" id="gallery">
                        <Plock gap={"24px"} breakpoints={this.state.columns}>
                            <Post user={new UserData("", "Person A", "https://unsplash.com/photos/_cvwXhGqG-o/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8OHx8ZmFjZXxlbnwwfDJ8fHwxNjQ4Nzc5NzYx")} post={new PostData("", { file: { url: "https://unsplash.com/photos/UWmrTAQ75iA/download?ixid=MnwxMjA3fDB8MXxhbGx8Mnx8fHx8fDJ8fDE2NDg4MzI0Njg" } })} />
                            <Post user={new UserData("", "Person B", "https://unsplash.com/photos/uJ8LNVCBjFQ/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MTN8fGZhY2V8ZW58MHwyfHx8MTY0ODc3OTc2MQ")} post={new PostData("", { file: { url: "https://unsplash.com/photos/7ptbiEPxKMQ/download?ixid=MnwxMjA3fDB8MXxhbGx8OXx8fHx8fDJ8fDE2NDg4MzI0Njg" } })} />
                            <Post user={new UserData("", "Person C", "https://unsplash.com/photos/u3pi6HhSYew/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MTd8fGZhY2V8ZW58MHwyfHx8MTY0ODc3OTc2MQ")} post={new PostData("", { file: { url: "https://unsplash.com/photos/ZiPlVmmKEYA/download?ixid=MnwxMjA3fDB8MXxhbGx8Mzl8fHx8fHwyfHwxNjQ4ODM2MDIz" } })} />
                            <Post user={new UserData("", "Person D", "https://unsplash.com/photos/TW_z_iUD_bQ/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8ODR8fHBvcnRyYWl0fGVufDB8Mnx8fDE2NDg4NDQ3MjQ")} post={new PostData("", { file: { url: "https://unsplash.com/photos/FTQJBGDxKXg/download?ixid=MnwxMjA3fDB8MXxhbGx8M3x8fHx8fDJ8fDE2NDg4NDMyNDY" } })} />
                            <Post user={new UserData("", "Person E", "https://unsplash.com/photos/kYtN89E5ce4/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MTA0fHxwb3J0cmFpdHxlbnwwfDJ8fHwxNjQ4ODQ0NzQy")} post={new PostData("", { file: { url: "https://unsplash.com/photos/zfhxiaZO3JE/download?ixid=MnwxMjA3fDB8MXxhbGx8Mjl8fHx8fHwyfHwxNjQ4ODQzMjQ1" } })} />
                            <Post user={new UserData("", "Person E", "https://unsplash.com/photos/kBonaevi3yA/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MTE5fHxwb3J0cmFpdHxlbnwwfDJ8fHwxNjQ4ODQ0NzQy")} post={new PostData("", { file: { url: "https://unsplash.com/photos/jm-JKqrAXsA/download?ixid=MnwxMjA3fDB8MXxhbGx8MTAyfHx8fHx8Mnx8MTY0ODg0MzI1NQ" } })} />
                        </Plock>
                    </div>
                </main>
            </div>
        );
    }
}