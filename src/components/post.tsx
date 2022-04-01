import { PureComponent } from "preact/compat";
import { PostData } from "../data/post";
import { UserData } from "../data/user";

type Props = {
    user: UserData;
    post: PostData;
};

export class Post extends PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }
    render({ user, post }: Props) {
        return (
            <div class="flex flex-col">
                <a href="#"><img class="rounded-3xl shadow object-cover" src={post.content.file.url} /></a>
                <div class="flex items-center justify-between py-4">
                    <a class="flex items-center" href="#">
                        <img class="w-11 h-11 rounded-full mr-4 border-2 border-[#AAB3CF]" src={user.avatar_url} />
                        <p class="text-data shadow text-xl font-medium">{user.display_name}</p>
                    </a>
                    <div class="flex text-data items-center">
                        <a class="mr-4 flex" href="#">
                            <span class="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#AAB3CF">
                                    <path d="M0 0h24v24H0V0z" fill="none" />
                                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                                </svg>
                            </span>
                            <span>5</span>
                        </a>
                        <a class="flex" href="#">
                            <span class="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#AAB3CF">
                                    <path d="M0 0h24v24H0V0z" fill="none" />
                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                                </svg>
                            </span>
                            <span>11</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}