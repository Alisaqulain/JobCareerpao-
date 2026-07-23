import type { BlogBlock } from "@/lib/blog";

export function BlogArticle({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="prose prose-slate mt-8 max-w-none space-y-4 text-slate-700">
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="font-display text-xl font-bold text-brand-dark pt-4">
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
