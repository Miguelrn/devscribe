import  { useEffect, useState } from 'react';
import 'highlight.js/styles/default.css'; // Or your preferred style
// import SyntaxHighlighter from 'react-syntax-highlighter';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StartIcon from '@mui/icons-material/Start';
import { Tooltip } from '@mui/material';
import { vscode } from '../utilities/vscode';

export const CodeBlock = ({className, type,  children, ...props }: {className: string, type: 'ia' | 'user', children: string}) => {
  const [language, setLanguage] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);    

  useEffect(() => {
    const match = /language-(\w+)/.exec(className )
    if(match && match?.length > 1){
        setLanguage(match[1]);
    }
  }, [className])

  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setTooltipOpen(true);

      // Hide tooltip after 2 seconds
      setTimeout(() => {
        setTooltipOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleCopyCode = () => {
    vscode.postMessage({
        role: "insertCode",
        content: children,
        language: language
    });
  }

  return (
    <div>
        {
            language ? (
                <>

                <div className={'flex justify-between align-bottom'}> 
                    {language}
                    {type === 'ia' && <div className="flex space-x-2">
                            <Tooltip placement="top" title="Copied!" open={tooltipOpen} arrow classes={{ tooltip: 'bg-green-400 text-white px-2 py-1 rounded-md shadow-md',}}>
                                <ContentCopyIcon className='cursor-pointer w-5 h-5 icon-white' onClick={copyToClipboard} />
                            </Tooltip>
                            <StartIcon  className='cursor-pointer w-5 h-5 icon-white' onClick={handleCopyCode} />
                        </div>
                    }
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
                <code className='undefined' {...props}>
                    {children}
                </code>
            )
        }    
        

    </div>
  );
};
