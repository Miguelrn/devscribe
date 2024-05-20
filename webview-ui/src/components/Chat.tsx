import { Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
// import { vscode } from "../utilities/vscode";

  
export default function Chat() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [msg, setMsg] = useState<{variant: 'ia' | 'user', msg: string}[]>([]);
    // [
    //     {variant: 'user', msg: 'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas "Letraset", las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum.'},
    //     {variant: 'ia', msg: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'},
    //     {variant: 'user', msg: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?'},
    //     {variant: 'ia', msg: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'},
    //     {variant: 'user', msg: "here a snipped of the fibonacci code:\n```language-cpp \n#include <iostream>\n```"},
    // ]);


    useEffect(() => {
        window.addEventListener('message', (e: MessageEvent) => {
            const data: {type: string, value: string, language: string} = e.data;
            console.log(data)
            switch (data.type) {
              case 'explain': {
                const variant: 'ia' | 'user' = 'ia';
                const new_msg: string = "Explain:\n```" + data.language + "\n" + data.value + "\n```"
                setMsg([...msg, {variant, msg: new_msg}])
                break;
              }
            }
        });
        // window.handleVsCodeMessage = (message: {type: string, value: string, langauge?: string}) => {
        //     console.log('Message from VS Code:', message);
        //     setMsg([...msg, {variant: 'user', msg: message.value}]);
        // };

        // vscode.postMessage({ type: 'onInfo', value: 'startup' });


    }, []);

    return (
        <Grid container>
            <Grid container className="h-[calc(100vh-6rem)] overflow-auto grid gap-4">
                {   
                    msg.map((m, index) => (
                        <Grid xs={12} key={index}>
                            <Paper className={`rounded ${m.variant}`}>
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
                    

                        <SendIcon className='cursor-pointer w-8 h-8 icon-fill'/>
                    
                    </div>
                    
                        
                </Paper>
                
            </Grid>
        </Grid>
    )
}
