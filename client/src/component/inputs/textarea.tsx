interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{
    label?: string;
}
export function TextArea({label, ...rest}: TextAreaProps){
    return (
        <div className={'relative w-full'}>
            {label && (
                <label className="text-gray-700 text-xs ">{label} {rest.required && <span className={'text-red-500'}>*</span>}</label>
            )}
            <textarea

                className={`w-full max-h-[10rem] p-2 border border-gray-300 rounded-md outline-0 resize-none  placeholder-gray-400 placeholder:text-sm first-letter ${rest.className}  `}
                {...rest}
            />
        </div>
    )
}