# Evaluación Automática de Informes con LLM

**Tesis de Pregrado** — Ingeniería Civil Informática, Universidad Católica del Maule

## Descripción

Sistema que automatiza la evaluación de informes universitarios utilizando LLMs con arquitectura de agentes y RAG (Retrieval-Augmented Generation). El sistema lee un informe en PDF, lo procesa contra una rúbrica definida y entrega un puntaje justificado por cada criterio.

Desarrollado con Llama 3.1 corriendo localmente mediante Ollama y LangChain como framework de orquestación.

## Motivación

La corrección manual de informes es un proceso lento y subjetivo. Este proyecto busca apoyar a los docentes entregando una evaluación estructurada y justificada de forma automática, manteniendo consistencia entre revisiones.

## Arquitectura

El sistema evolucionó en cuatro etapas progresivas:

### Etapa 1 — RAG Simple

La primera versión usa RAG directo: se carga el PDF del informe, se divide en chunks y se almacena en un vectorstore con embeddings. Luego se le pasan múltiples prompts al LLM, uno por criterio de la rúbrica, obteniendo puntaje y justificación para cada uno.

### Etapa 2 — RAG con Historial de Conversación

Agrega memoria de conversación. Cada criterio se divide en dos prompts: primero una pregunta para extraer información del informe, luego una pregunta de evaluación que usa la respuesta anterior como contexto. Esto mejora la coherencia entre la justificación y el puntaje asignado.

### Etapa 3 — Agentes con LangGraph

Reemplaza la cadena lineal por un grafo de agentes con LangGraph. El flujo agrega detección de alucinaciones y reformulación automática de preguntas cuando la respuesta generada no está fundamentada en el documento.

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

![Diagrama de flujo de etapa 3](/images/llm/etapa3.png)

### Etapa 4 — Descomposición de Preguntas Complejas

La versión final extiende el grafo con dos nuevos agentes:

**Agente de complejidad** — determina si una pregunta evalúa múltiples ideas o términos ambiguos:

```python
# Ejemplo de salida
{"is_complex": "si"}  # pregunta con múltiples criterios
{"is_complex": "no"}  # pregunta simple y directa
```

**Agente simplificador** — descompone la pregunta compleja en subpreguntas simples, cada una abordando un solo punto:

```python
# Entrada: "Evalúa la claridad del argumento y la calidad de las evidencias"
# Salida:
{
  "1": "¿Es claro el argumento del estudiante?",
  "2": "¿Es de buena calidad la evidencia proporcionada?"
}
```

Cada subpregunta se responde con RAG de forma independiente, y un agente sintetizador une todas las respuestas antes de pasar a la evaluación final con la rúbrica.

El grafo completo:

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

![Diagrama de flujos de etapa 4](/images/llm/etapa4.png)

## Stack Técnico

- **Llama 3.1** — LLM local vía Ollama
- **nomic-embed-text** — modelo de embeddings
- **LangChain** — orquestación de cadenas RAG
- **LangGraph** — grafo de agentes con estado
- **ChromaDB** — vectorstore para búsqueda semántica
- **PyPDF** — carga y parsing de documentos PDF

## Resultado

El sistema evalúa automáticamente informes universitarios con puntajes consistentes y justificaciones coherentes con el contenido del documento, reduciendo significativamente el tiempo de corrección manual.

## Repositorio

[github.com/DiegoGUrra/automatic-scoring-LLM](https://github.com/DiegoGUrra/automatic-scoring-LLM)
