import { getTest } from "../src/lib/content";
import { encodeAnswers } from "../src/lib/engine/score";
const t = getTest(process.argv[2])!;
const max = Math.max(...t.options.map(o => o.value));
const answers = Object.fromEntries(t.questions.map(q => [q.id, max]));
console.log(encodeAnswers(t, answers));
