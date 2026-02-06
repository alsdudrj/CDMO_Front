interface ColGroupProps {
    columns: Array<string>;
}

const ColGroup:React.FC<ColGroupProps> = ({columns}) => (
    <colgroup>
        {columns.map((width, idx) => (
            <col key={idx} style={{width}}/>
        ))}
    </colgroup>
);
export default ColGroup;
