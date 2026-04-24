const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const USER_ID = "ruchirsingh_24042005"; 
const EMAIL_ID = "rs6404@srmist.edu.in";
const ROLL    = "RA2311003011086";

function processData(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const validEdges = [];

  for (const raw of data) {
    if (typeof raw !== "string") { invalid_entries.push(String(raw)); continue; }
    const t = raw.trim();
    if (!/^[A-Z]->[A-Z]$/.test(t)) { invalid_entries.push(raw); continue; }
    if (seenEdges.has(t)) {
      if (!duplicate_edges.includes(t)) duplicate_edges.push(t);
    } else {
      seenEdges.add(t); validEdges.push(t);
    }
  }

  const childParent = {};
  const children = {};
  const allNodes = new Set();

  for (const e of validEdges) {
    const [p, c] = e.split("->");
    allNodes.add(p); allNodes.add(c);
    if (!(c in childParent)) {
      childParent[c] = p;
      (children[p] = children[p] || []).push(c);
    }
  }

  const uf = {};
  const find = x => { uf[x] = uf[x] ?? x; return uf[x] === x ? x : (uf[x] = find(uf[x])); };
  const union = (a, b) => { uf[find(a)] = find(b); };
  for (const e of validEdges) union(...e.split("->"));

  const comps = {};
  for (const n of allNodes) { const r = find(n); (comps[r] = comps[r] || new Set()).add(n); }

  function buildTree(node, visiting = new Set()) {
    if (visiting.has(node)) return null;
    visiting = new Set(visiting); visiting.add(node);
    const obj = {};
    for (const c of (children[node] || [])) {
      const sub = buildTree(c, visiting);
      if (sub === null) return null;
      obj[c] = sub;
    }
    return obj;
  }

  function depth(subtree) {
    const keys = Object.keys(subtree);
    return keys.length === 0 ? 1 : 1 + Math.max(...keys.map(k => depth(subtree[k])));
  }

  const hierarchies = [];

  for (const nodes of Object.values(comps)) {
    const compRoots = [...nodes].filter(n => !(n in childParent)).sort();
    if (compRoots.length === 0) {
      const root = [...nodes].sort()[0];
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      for (const root of compRoots) {
        const sub = buildTree(root);
        if (sub === null) {
          hierarchies.push({ root, tree: {}, has_cycle: true });
        } else {
          hierarchies.push({ root, tree: { [root]: sub }, depth: depth(sub) });
        }
      }
    }
  }

  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic    = hierarchies.filter(h =>  h.has_cycle);

  let largest_tree_root = "";
  let maxD = -1;
  for (const h of nonCyclic) {
    if (h.depth > maxD || (h.depth === maxD && h.root < largest_tree_root)) {
      maxD = h.depth; largest_tree_root = h.root;
    }
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: ROLL,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: nonCyclic.length,
      total_cycles: cyclic.length,
      largest_tree_root,
    },
  };
}

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: "data must be an array" });
    res.json(processData(data));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
