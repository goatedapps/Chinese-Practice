import type { GroupResult, QuestionGroup } from "../../data/types";
import { correctOptionFor } from "../../lib/grading";
import { RichText } from "../../lib/richText";

interface ResultReviewProps {
  groups: QuestionGroup[];
  results: GroupResult[];
}

export function ResultReview({ groups, results }: ResultReviewProps) {
  let number = 0;
  return (
    <div className="result-review">
      <h2>错题回顾 <span lang="en">Review mistakes</span></h2>
      {groups.map((group, groupIndex) => {
        const questions = group.questions
          .map((question, index) => ({ question, item: results[groupIndex]?.items[index], number: ++number }))
          .filter(({ item }) => item?.correct !== true);
        if (!questions.length) return null;
        return (
          <section className="result-review-group" key={group.groupId}>
            {group.passage && (
              <details className="result-review-passage">
                <summary>查看短文：{group.passage.title}</summary>
                <p>{group.passage.text}</p>
              </details>
            )}
            {questions.map(({ question, item, number }) => {
              const options = group.optionBank ?? (question.format === "MCQ" ? question.options : undefined) ?? [];
              const chosen = question.format === "MCQ" ? options.find((option) => option.key === item?.answer)?.text : item?.answer;
              const correct = question.format === "MCQ" ? correctOptionFor(question, group)?.text : question.displayAnswer;
              return (
                <article className="result-review-question" key={question.qNo}>
                  <h3>Q{number}</h3>
                  <div><RichText text={question.text} /></div>
                  {question.context && <p>{question.context}</p>}
                  <p className="result-review-answer"><span>你的答案 Your answer</span>{chosen || "未作答 No answer"}</p>
                  <p className="result-review-answer result-review-correct"><span>参考答案 Suggested answer</span>{correct}</p>
                  {item?.aiFeedback && <p>{item.aiFeedback}</p>}
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
