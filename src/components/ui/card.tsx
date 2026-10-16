import { scv } from 'css-variants'
import { cn } from '../../utils/cn';

const styles = scv({
    slots:['root','header','content','footer'],
    base: {
        root:'card card-border bg-base-100 shadow-sm',
        header:'card-title',
        content:'card-body',
        footer:'justify-end card-actions',
    },
    variants: {
        side:{
            true: {
                root:'lg:card-side',
            },
        },
        size:{
            full: {
                root: 'w-full card-xl',
            },
            xl: {
                root: 'w-96 card-xl',
            },
            lg: {
                root: 'w-96 card-lg',
            },
            md: {
                root: 'w-72 card-md',
            },
            sm: {
                root: 'w-48 card-sm',
            },
        },
    },
    defaultVariants:{
        size: 'lg',
        side: false,
    },
});

type CardProps = Parameters<typeof styles>[0] & Omit<React.HTMLAttributes<HTMLDivElement>,'content'> & {
    title: string;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    figure?: React.ReactNode;
};

export const Card = (props: CardProps) => {
    const {title, content, footer,size,side,figure,className,...rest} = props;
    const layoutClass = styles({size, side});

    return <div className={cn(layoutClass.root, className)} {...rest}>
        {side && <figure>
            {figure}
        </figure>}
        <div className={layoutClass.content}>
            {title && <h2 className={layoutClass.header}>{title}</h2>}
            {content}
            {footer && <div className={layoutClass.footer}>
                {footer}
            </div>}
        </div>
    </div>
}