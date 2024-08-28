import { Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { ChangeEvent, useEffect, useState, KeyboardEvent, useRef, memo, useMemo } from 'react';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { vscode } from '../utilities/vscode';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { CodeBlock } from './CodeBlock';




type Message = {
    variant: 'ia' | 'user';
    msg: string;
};

export default function Chat() {
    const [msgList, setMsgList] = useState<Message[]>([]);
    // const memoizedMsgList = useMemo (() => msgList, [msgList])
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const [currentIconIndex, setCurrentIconIndex] = useState(0);
    const [input, setInput] = useState<string>('');
    const chatRef = useRef<HTMLDivElement | null>(null);
    const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

    const printMsg = (data: {role: string, content: string, done: boolean}) => {
        switch (data.role) {
            case 'assistant': {
                const variant: 'ia' | 'user' = 'ia';
                const response: string  = data.content; 

                if(!data.done)
                    setMsgList((prevItems) => {
                        const lastIndex = prevItems.length - 1;
                        const newItems = [...prevItems];

                        if (lastIndex >= 0 && newItems[lastIndex].variant === variant) {
                            newItems[lastIndex] = {
                                ...newItems[lastIndex],
                                msg: (newItems[lastIndex].msg || '') + response
                            };
                        } else { // insert thhe first word in a new response
                            setIsUserScrolling(false); // reset previous user scrolling
                            newItems.push({ variant: 'ia', msg: response });
                        }

                        return newItems;
                    });
                else
                    setIsLoading(false);
                break;          
            }
            case 'user': {
                const variant: 'ia' | 'user' = 'user';
                const newMsg: string = data.content
                setMsgList((prevItems) => [...prevItems, {variant, msg: newMsg}]);
                setIsLoading(true);
                break;
            }
        }
    }
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data: {role: string, content: string, done: boolean} = event.data;
            printMsg(data);
            console.log(data)
        };
        console.log('this event should fire one time only') // never fired???
        window.addEventListener('message', handleMessage);

        // return () => {
        //     window.removeEventListener('message', handleMessage);
        // };
    }, []);

    useEffect(() => {
        if (chatRef.current && !isUserScrolling) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [msgList, isUserScrolling])

    const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && input !== '') {
            event.preventDefault(); // Prevent default behavior (submitting form)
            sendMsg();
        } 
    };

    const sendMsg = () => {
        const question = input;
        setInput('');
        
        printMsg({role: 'user', content: question, done: true});
        vscode.postMessage({
            role: "user",
            content: input
        });
    }

    const newChat = () => {
        setMsgList([])
    }

    const handleWheel = () => {
        setIsUserScrolling(true);
    }

    // Memoized Markdown Message Component
    const MarkdownMemo = (message: Message) => {
        const ReactMarkdownMemo = useMemo(() => {
            const { msg, variant } = message;
            console.log('msg update: ', msg)

            const ComponentConstructor = () => (
                <ReactMarkdown
                    children={msg}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ children, className, ...props }) {
                            return (
                            <CodeBlock className={className || ''} type={variant} {...props}>
                                {String(children)}
                            </CodeBlock>
                            );
                        },
                    }}
                />
            );
            return ComponentConstructor;
        }, [message]);
        return <ReactMarkdownMemo />;
    };

    const MarkdownComponent = memo(MarkdownMemo);

    return (
        <>
            <Grid container className="h-[calc(100vh-6rem)] overflow-auto" direction="column" justifyContent={"flex-start"} alignItems={"center"} ref={chatRef} onWheel={handleWheel}>
                {   
                    msgList.map((m, index) => (
                        <Grid xs={12} key={index}>
                            <Paper className={`rounded ${m.variant} my-2 whitespace-pre-wrap`}>
                                {/* <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    children={m.msg}
                                    
                                    components={{
                                        code({children, className, ...props}) {
                                            return <CodeBlock className={className || ''} type={m.variant} {...props}>{String(children)}</CodeBlock>
                                        },
                                    }}
                                ></ReactMarkdown> */}
                                <MarkdownComponent msg={m.msg} variant={m.variant} />
                            </Paper>
                        </Grid>
                    ))
                }
            </Grid>

            <FiberNewIcon fontSize='small' className='cursor-pointer w-12 icon-fill absolute bottom-5 left-5' onClick={newChat}></FiberNewIcon>
            
            <Grid container className={'absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-[75vw]'}>
                <Paper className={`m-2 rounded user`}>
                    <div className={'flex space-between'}>
                        
                        <textarea
                            value={input}
                            placeholder='LLM-Helper'
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            rows={2} // Set the number of visible rows
                            className='w-full max-h-20 overflow-auto resize-none focus:outline-none' // Adjust width and height as needed
                        />
                    

                        {!isLoading ? 
                        <SendIcon className='cursor-pointer w-8 h-8 icon-fill' onClick={sendMsg}/> 
                        : 
                        <div className="grid min-h-[30px] place-items-center rounded-lg">
                            <svg className="w-8 h-8 animate-spin loading-icon" viewBox="0 0 64 64" fill="none"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                <path
                                d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                                stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path
                                d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                                stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" className="text-gray-900">
                                </path>
                            </svg>
                        </div>
                        }
                    </div>
                </Paper>
            </Grid>
        </>
    )
}
