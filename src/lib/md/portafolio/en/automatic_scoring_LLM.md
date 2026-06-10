# Automatic Essay Scoring with LLM Agents

**Undergraduate Thesis** — Computer Civil Engineering, Universidad Católica del Maule

## Description

A system that automates the grading of university reports using LLMs with an agent architecture and RAG (Retrieval-Augmented Generation). The system reads a PDF report, processes it against a defined rubric, and delivers a justified score for each criterion.

Built with Llama 3.1 running locally via Ollama and LangChain as the orchestration framework.

## Motivation

Manual grading of reports is a slow and subjective process. This project aims to support instructors by delivering structured, justified evaluations automatically while maintaining consistency across reviews.

## Architecture

The system evolved through four progressive stages:

### Stage 1 — Simple RAG

The first version uses direct RAG: the PDF report is loaded, split into chunks and stored in a vector store with embeddings. Multiple prompts are then sent to the LLM, one per rubric criterion, returning a score and justification for each.

### Stage 2 — RAG with Conversation History

Adds conversation memory. Each criterion is split into two prompts: first a question to extract information from the report, then an evaluation question that uses the previous answer as context. This improves coherence between the justification and the assigned score.

### Stage 3 — Agents with LangGraph

Replaces the linear chain with an agent graph using LangGraph. The flow adds hallucination detection and automatic question reformulation when the generated answer is not grounded in the document.

```python
workflow.add_conditional_edges(
    "generate",
    grade_generation_v_documents_and_question,
    {
        "useful": "grader",
        "not useful": "reformulate_question",
    },
)
```

![Stage 3 flow diagram](/images/llm/etapa3.png)

### Stage 4 — Complex Question Decomposition

The final version extends the graph with two new agents:

**Complexity agent** — determines whether a question evaluates multiple ideas or ambiguous terms:

```python
# Example output
{"is_complex": "yes"}  # question with multiple criteria
{"is_complex": "no"}   # simple, direct question
```

**Simplifier agent** — breaks the complex question down into simple sub-questions, each addressing a single point:

```python
# Input: "Evaluate the clarity of the argument and the quality of the evidence"
# Output:
{
  "1": "Is the student's argument clear?",
  "2": "Is the evidence provided of good quality?"
}
```

Each sub-question is answered independently with RAG, and a summarizer agent combines all answers before passing to the final rubric-based grading.

The full graph:

```python
workflow.set_conditional_entry_point(
    is_q_complex,
    {
        "complex": "complex_generate",
        "not complex": "generate",
    },
)
workflow.add_edge("complex_generate", "grader")
workflow.add_conditional_edges(
    "generate",
    grade_generation_v_documents_and_question,
    {
        "useful": "grader",
        "not useful": "reformulate_question",
    },
)
workflow.add_edge("reformulate_question", "grader")
workflow.set_finish_point("grader")
```

![Stage 4 flow diagram](/images/llm/etapa4.png)

## Tech Stack

- **Llama 3.1** — local LLM via Ollama
- **nomic-embed-text** — embeddings model
- **LangChain** — RAG chain orchestration
- **LangGraph** — stateful agent graph
- **ChromaDB** — vector store for semantic search
- **PyPDF** — PDF document loading and parsing

## Result

The system successfully grades university reports automatically with consistent scores and justifications coherent with the document content, significantly reducing manual grading time.

## Repository

[github.com/DiegoGUrra/automatic-scoring-LLM](https://github.com/DiegoGUrra/automatic-scoring-LLM)
