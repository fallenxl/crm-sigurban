interface Props {
  cols: number;
  rows: number;
}
export const SkeletonRow = ({ cols, rows }: Props) => {
  return (
    <>
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <tr key={i} className="border-b">
            {Array(cols)
              .fill(0)
              .map((_, i) => (
                <td
                  key={i}
                  className="p-4 border-b border-blue-gray-50 animate-pulse"
                >
                  <div className="h-4 bg-gray-300 w-3/4 rounded-md"></div>
                </td>
              ))}
          </tr>
        ))}
    </>
  );
};
