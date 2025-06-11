'use client';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

export const QuillHtmlViewer = ({ delta }: { delta: any }) => {
  let html = '';
  try {
    const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
    html = converter.convert();
    console.log("Generated HTML:", html); // <-- Add this line
  } catch {
    html = typeof delta === 'string' ? delta : '';
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
export const AgreementViewer = ({ agreementContent }: { agreementContent: object | null }) => {
   if (!agreementContent) {
      return <div className="text-center text-gray-500">No agreement available</div>;
   }

   let delta = agreementContent
   return (
      <div className="quill-agreement-content  max-w-4xl w-full h-[80vh] overflow-x-hidden overflow-y-auto rounded-2xl lg:px-8 p-4 bg-white dark:bg-neutral-800">
         <QuillHtmlViewer delta={delta} />
         
      </div>
   );
};