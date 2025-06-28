import { getUserRiskProfileAnswers, getUserRiskProfileById } from "@/lib/data/admin/risk-profile";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { findUserById } from "@/lib/data/user";

function getAnswerLabel(answer: string, question: any) {
  if ((question.type === "MCQ" || question.type === "YES_NO") && Array.isArray(question.options)) {
    const found = question.options.find((opt: any) => String(opt.value) === String(answer));
    return found ? found.text : answer;
  }
  return answer;
}

function getOptionsLabel(question: any) {
  if ((question.type === "MCQ" || question.type === "YES_NO") && Array.isArray(question.options)) {
    return question.options
      .map((opt: any) => `${opt.text} (${opt.value})`)
      .join(", ");
  }
  if (question.type === "SCALE" && question.options) {
    return `Range: ${question.options.minScore} - ${question.options.maxScore}`;
  }
  return "-";
}

function getOptionsList(answer: string, question: any) {
  if ((question.type === "MCQ" || question.type === "YES_NO") && Array.isArray(question.options)) {
    return (
      <ul className="space-y-1">
        {question.options.map((opt: any) => (
          <li
            key={opt.value}
            className={`flex justify-between items-center gap-2 px-2 py-1 rounded ${
              String(opt.value) === String(answer) ? "bg-primary/10 font-bold text-primary" : ""
            }`}
          >
            <span>
              {opt.text}
            </span>
            <span>
              <Badge variant="secondary" className="text-xs">
                {typeof opt.weight !== "undefined"
                  ? opt.weight
                  : typeof opt.score !== "undefined"
                  ? opt.score
                  : "-"}
              </Badge>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  
  if (question.type === "SCALE" && question.options) {
    return (
      <span>
        Range: <Badge>{question.options.minScore}</Badge> - <Badge>{question.options.maxScore}</Badge>
      </span>
    );
  }
  return "-";
}

export default async function UserRiskProfileAnswersPage({ params }: { params: { userId: string } }) {
  const { userId } = await params

  const [user , answers] = await Promise.all([
    findUserById(userId),
      getUserRiskProfileAnswers(userId)
   ]);

  return (
    <div className="max-w-5xl overflow-x-auto mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">{user?.name} Risk Profile Answers</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
         <TableBody>
         {answers.map((item: any, idx: number) => (
            <TableRow key={item.id}>
               <TableCell>{idx + 1}</TableCell>
               <TableCell>{item.question?.question}</TableCell>
               <TableCell>
               <Badge variant="outline">{item.question?.type}</Badge>
               </TableCell>
               <TableCell>
               <Badge variant={item.question?.category === "PLATINA_WEALTH" ? "destructive" : "default"}>
                  {item.question?.category}
               </Badge>
               </TableCell>
               <TableCell>
               {getOptionsList(item.answer, item.question)}
               </TableCell>
               <TableCell>
               {getAnswerLabel(item.answer, item.question)}
               </TableCell>
               <TableCell>{item.score}</TableCell>
            </TableRow>
         ))}
         </TableBody>
        </Table>
        {answers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No answers found for this user.</div>
          </div>
        )}
      </div>
    </div>
  );
}