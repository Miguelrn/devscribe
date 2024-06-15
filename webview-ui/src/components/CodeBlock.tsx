import  { useEffect, useState } from 'react';
import 'highlight.js/styles/default.css'; // Or your preferred style
// import SyntaxHighlighter from 'react-syntax-highlighter';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StartIcon from '@mui/icons-material/Start';

export const CodeBlock = ({className, children }: {className: string, children: string}) => {
  const [language, setLanguage] = useState<string | null>(null);


  useEffect(() => {
    const match = /language-(\w+)/.exec(className )
    console.log(match)
    if(match && match?.length > 1){
        setLanguage(match[1]);
    }
  }, [className])

  return (
    <div>
        {
            language ? (
                <>
                <div>
                    <div className={'flex justify-between align-bottom'}>
                        {language}
                        <div className="flex space-x-2">
                            <ContentCopyIcon className='cursor-pointer w-5 h-5 icon-white' /> Copy code
                            <StartIcon  className='cursor-pointer w-5 h-5 icon-white' /> Insert code
                        </div>
                    </div>
                    <SyntaxHighlighter
                        PreTag="div"
                        children={String(children).replace(/\n$/, '')} 
                        language={language}
                        style={dark}
                        wrapLongLines
                        showLineNumbers
                    />
                </div>
                </>
            ):
            (
                <code className={className}>
                    {children}
                </code>
            )
        }    
        

    </div>
  );
};
