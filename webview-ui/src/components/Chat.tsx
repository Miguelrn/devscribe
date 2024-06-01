import { Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';


const icons = [
    <HourglassEmptyIcon key="empty" className={'w-8 h-8 icon-fill cursor-not-allowed'} />,
    <HourglassTopIcon key="top" className={'w-8 h-8 icon-fill cursor-not-allowed'} />,
    <HourglassBottomIcon key="bottom" className={'w-8 h-8 icon-fill cursor-not-allowed'} />,
    <HourglassFullIcon key="full" className={'w-8 h-8 icon-fill cursor-not-allowed'} />,
]; 

export default function Chat() {
    const [msgList, setMsgList] = useState<{variant: 'ia' | 'user', msg: string}[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentIconIndex, setCurrentIconIndex] = useState(0);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data: {type: string, value: string, language: string} = event.data;
    
            switch (data.type) {
                case 'explain': {
                    const variant: 'ia' | 'user' = 'user';
                    const newMsg: string = "Explain:\n```" + data.language + "\n" + data.value + "\n```"
                    setMsgList((prevItems) => [...prevItems, {variant, msg: newMsg}]);
                    setIsLoading(true);
                    break;
                }
                case 'response': {
                    const variant: 'ia' | 'user' = 'ia';
                    const response: string  = data.value; 
                    setMsgList((prevItems) => [...prevItems, {variant, msg: response}]);
                    setIsLoading(false);
                    break;          
                }
            }
        };
    
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
          interval = setInterval(() => {
            setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
          }, 400);
        }
    
        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };
      }, [isLoading]);

    return (
        <>
            <Grid container className="h-[calc(100vh-6rem)] overflow-auto" direction="column" justifyContent={"flex-start"} alignItems={"center"}>
                {   
                    msgList.map((m, index) => (
                        <Grid xs={12} key={index}>
                            <Paper className={`rounded ${m.variant} my-2`}>
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    children={m.msg}
                                    components={{
                                        code(props) {
                                            const {children, className, ...rest} = props
                                            const match = /language-(\w+)/.exec(className || '')
                                            return match ? (
                                                <SyntaxHighlighter
                                                    PreTag="div"
                                                    children={String(children).replace(/\n$/, '')}
                                                    language={match[1]}
                                                    style={dark}
                                                />
                                            ) : (
                                                <code {...rest} className={className}>
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                ></ReactMarkdown>
                            </Paper>
                        </Grid>
                    ))
                }
            </Grid>

            <Grid container className={'absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-[75vw]'}>
                <Paper className={`m-2 rounded user`}>
                    <div className={'flex space-between'}>
                        
                        <div contentEditable data-text="LLM-Helper" className='w-full max-h-10 overflow-auto'></div>
                    

                        {!isLoading ? 
                        <SendIcon className='cursor-pointer w-8 h-8 icon-fill'/> : 
                        icons[currentIconIndex]}
                    
                    </div>
                </Paper>
            </Grid>
        </>
    )
}
