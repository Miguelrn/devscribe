import  { useEffect, useState } from 'react';
import 'highlight.js/styles/default.css'; // Or your preferred style
// import SyntaxHighlighter from 'react-syntax-highlighter';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StartIcon from '@mui/icons-material/Start';

export const CodeBlock = ({className, children, ...props }: {className: string, children: string}) => {
  const [language, setLanguage] = useState<string | null>(null);

  useEffect(() => {
    const match = /language-(\w+)/.exec(className )
    if(match && match?.length > 1){
        setLanguage(match[1]);
    }
  }, [className])

  return (
    <div>
        {
            language ? (
                <>
                {/* TODO maybe display this only is llm and not user ? */}
                <div className={'flex justify-between align-bottom'}> 
                    {language}
                    <div className="flex space-x-2">
                        <ContentCopyIcon className='cursor-pointer w-5 h-5 icon-white' /> Copy code
                        <StartIcon  className='cursor-pointer w-5 h-5 icon-white' /> Insert code
                    </div>
                </div>
                <SyntaxHighlighter
                    {...props}
                    PreTag="div"
                    children={String(children).replace(/\n$/, '')} 
                    language={language}
                    style={dark}
                    wrapLongLines
                    showLineNumbers
                />
                </>
            ):
            (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }    
        

    </div>
  );
};
