// import React, { useState, useEffect, useRef } from "react";

// import mermaid from "mermaid";

// export const WelcomePage = () => {
// 	const [pythonCode, setPythonCode] = useState(
// 		`def example():\n    if condition:\n        do_something()\n    else:\n        do_something_else()\n`
// 	);
// 	const [mermaidCode, setMermaidCode] = useState("");
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [error, setError] = useState("");
// 	const diagramRef = useRef(null);

// 	// Initialize mermaid once
// 	useEffect(() => {
// 		mermaid.initialize({
// 			startOnLoad: false,
// 			theme: "default",
// 			flowchart: { curve: "linear" },
// 		});
// 	}, []);

// 	// Render diagram whenever mermaid code changes
// 	useEffect(() => {
// 		if (mermaidCode && diagramRef.current) {
// 			try {
// 				mermaid.render("mermaid-diagram", mermaidCode).then(({ svg }) => {
// 					diagramRef.current.innerHTML = svg;
// 				});
// 			} catch (error) {
// 				setError(`Failed to render diagram: ${error.message}`);
// 			}
// 		}
// 	}, [mermaidCode]);

// 	// ...existing code...
// 	const convertToMermaid = async () => {
// 		setIsLoading(true);
// 		setError("");
// 		try {
// 			// Load Pyodide only when needed
// 			const { loadPyodide } = await import("pyodide");
// 			const pyodide = await loadPyodide();

// 			// Fix: Remove the indentation in the template string
// 			await pyodide.loadPackagesFromImports(`import ast`);

// 			const result = await pyodide.runPythonAsync(`
// import ast

// def convert_python_to_mermaid(code):
//     try:
//         tree = ast.parse(code)
//     except SyntaxError as e:
//         return f"graph TD\\nA[Syntax Error: {str(e)}]"

//     node_counter = 0
//     nodes = {}

//     def get_node_id(prefix):
//         nonlocal node_counter
//         node_counter += 1
//         return f"{prefix}_{node_counter}"

//     def get_node_label(node):
//         if isinstance(node, ast.Call):
//             if isinstance(node.func, ast.Name):
//                 return f"{node.func.id}()"
//             elif isinstance(node.func, ast.Attribute):
//                 return f"{ast.unparse(node.func) if hasattr(ast, 'unparse') else 'method call'}"
//             return "function call"
//         elif isinstance(node, ast.Name):
//             return node.id
//         elif isinstance(node, ast.Constant):
//             return str(node.value)
//         else:
//             return type(node).__name__

//     mermaid = ["graph TD"]

//     # Track parent relationships for when we skip nodes
//     parent_child_map = {}

//     def process_node(node, parent_id=None):
//         # We'll only create nodes for functions, if statements, and function calls

//         if isinstance(node, ast.FunctionDef):
//             node_id = get_node_id("func")
//             nodes[node_id] = node
//             mermaid.append(f'{node_id}["Function: {node.name}"]')

//             last_child_id = None
//             for stmt in node.body:
//                 child_id = process_node(stmt, node_id)
//                 if child_id:
//                     last_child_id = child_id

//             # Store relationship for later
//             if parent_id and node_id:
//                 parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

//             return node_id

//         elif isinstance(node, ast.If):
//             node_id = get_node_id("if")
//             cond_text = ast.unparse(node.test) if hasattr(ast, 'unparse') else "condition"
//             # Escape any quotes in the condition text for Mermaid
//             cond_text = cond_text.replace('"', '\\\\"')
//             mermaid.append(f'{node_id}{{"If: {cond_text}"}}')

//             # True branch
//             true_branch_nodes = []
//             for stmt in node.body:
//                 child_id = process_node(stmt, node_id)
//                 if child_id:
//                     true_branch_nodes.append(child_id)

//             # False branch
//             false_branch_nodes = []
//             if node.orelse:
//                 for stmt in node.orelse:
//                     child_id = process_node(stmt, node_id)
//                     if child_id:
//                         false_branch_nodes.append(child_id)

//             # Connect condition to true branch
//             if true_branch_nodes:
//                 for child_id in true_branch_nodes:
//                     mermaid.append(f"{node_id} -->|Yes| {child_id}")

//             # Connect condition to false branch
//             if false_branch_nodes:
//                 for child_id in false_branch_nodes:
//                     mermaid.append(f"{node_id} -->|No| {child_id}")
//             elif node.orelse:
//                 # If we have else but no visible nodes there
//                 pass_id = get_node_id("else")
//                 mermaid.append(f'{pass_id}["..."]')
//                 mermaid.append(f"{node_id} -->|No| {pass_id}")

//             # Store relationship for later
//             if parent_id and node_id:
//                 parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

//             return node_id

//         elif isinstance(node, ast.Expr):
//             if isinstance(node.value, ast.Call):
//                 node_id = get_node_id("call")
//                 call_text = ast.unparse(node.value) if hasattr(ast, 'unparse') else get_node_label(node.value)
//                 # Escape any quotes in the call text for Mermaid
//                 call_text = call_text.replace('"', '\\\\"')
//                 mermaid.append(f'{node_id}["{call_text}"]')

//                 # Store relationship for later
//                 if parent_id and node_id:
//                     parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

//                 return node_id

//         # For other node types, we need to traverse them but not create nodes
//         elif isinstance(node, ast.Assign) or isinstance(node, ast.AnnAssign):
//             # Check if the right side has function calls we should extract
//             if isinstance(node.value, ast.Call):
//                 return process_function_call(node.value, parent_id)
//             return None

//         # Even though we skip these nodes, we need to traverse their children
//         elif isinstance(node, (ast.For, ast.While)):
//             result_nodes = []
//             for stmt in node.body:
//                 child_id = process_node(stmt, parent_id)
//                 if child_id:
//                     result_nodes.append(child_id)
//             return result_nodes[0] if result_nodes else None

//         # Traverse other node types to find function calls and conditions
//         else:
//             # Recurse through any child nodes this might have
//             for child in ast.iter_child_nodes(node):
//                 child_id = process_node(child, parent_id)
//                 if child_id and parent_id:
//                     parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [child_id]

//         return None

//     # Extract function calls from expressions
//     def process_function_call(node, parent_id):
//         if isinstance(node, ast.Call):
//             node_id = get_node_id("call")
//             call_text = ast.unparse(node) if hasattr(ast, 'unparse') else get_node_label(node)
//             # Escape any quotes in the call text for Mermaid
//             call_text = call_text.replace('"', '\\\\"')
//             mermaid.append(f'{node_id}["{call_text}"]')

//             # Store relationship for later
//             if parent_id and node_id:
//                 parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

//             return node_id
//         return None

//     # Start processing from the top level of the AST
//     last_node = None
//     for node in tree.body:
//         node_id = process_node(node)
//         if node_id:
//             if last_node:
//                 # Connect top-level nodes in sequence
//                 mermaid.append(f"{last_node} --> {node_id}")
//             last_node = node_id

//     # Process the parent-child relationships
//     for parent, children in parent_child_map.items():
//         for child in children:
//             mermaid.append(f"{parent} --> {child}")

//     return "\\n".join(mermaid)

// convert_python_to_mermaid('''${pythonCode}''')
// `);

// 			setMermaidCode(result);
// 		} catch (error) {
// 			setError(`Error: ${error.message}`);
// 			console.error(error);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};
// 	// ...existing code...

// 	return (
// 		<div className="space-y-4 p-4">
// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Python Code</label>
// 				<textarea
// 					className="h-64 w-full rounded border p-2 font-mono text-sm"
// 					onChange={(e) => setPythonCode(e.target.value)}
// 					value={pythonCode}
// 				/>
// 			</div>

// 			<div className="flex space-x-2">
// 				<button
// 					className="hover:bg-blue-600 disabled:bg-blue-300 rounded bg-blue-500 px-4 py-2 text-white"
// 					disabled={isLoading || !pythonCode.trim()}
// 					onClick={convertToMermaid}
// 				>
// 					{isLoading ? "Converting..." : "Convert to Mermaid"}
// 				</button>

// 				{mermaidCode ? (
// 					<button
// 						className="rounded border px-4 py-2 hover:bg-gray-100"
// 						onClick={() => navigator.clipboard.writeText(mermaidCode)}
// 					>
// 						Copy Mermaid Code
// 					</button>
// 				) : null}
// 			</div>

// 			{error ? <div className="bg-red-50 border-red-200 text-red-700 rounded border p-3">{error}</div> : null}

// 			{mermaidCode ? (
// 				<div className="space-y-2">
// 					<h3 className="font-medium">Mermaid Diagram</h3>
// 					<div className="max-h-96 overflow-auto rounded border bg-white p-4" ref={diagramRef} />

// 					<div>
// 						<h3 className="font-medium">Mermaid Code</h3>
// 						<pre className="bg-gray-50 max-h-64 overflow-auto rounded border p-4 text-sm">
// 							{mermaidCode}
// 						</pre>
// 					</div>
// 				</div>
// 			) : null}
// 		</div>
// 	);
// };

// import React, { useState, useEffect, useRef } from "react";

// import mermaid from "mermaid";

// const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
// 	const containerRef = useRef<HTMLDivElement>(null);

// 	useEffect(() => {
// 		if (containerRef.current && chart) {
// 			const renderChart = async () => {
// 				containerRef.current.innerHTML = "";
// 				try {
// 					const { svg } = await mermaid.render("mermaid-diagram", chart);
// 					if (containerRef.current) {
// 						containerRef.current.innerHTML = svg;
// 					}
// 				} catch (error) {
// 					console.error("Mermaid rendering failed:", error);
// 					if (containerRef.current) {
// 						containerRef.current.innerHTML = `<div class="error">Diagram rendering failed</div>`;
// 					}
// 				}
// 			};

// 			renderChart();
// 		}
// 	}, [chart]);

// 	return <div ref={containerRef} />;
// };

// export const WelcomePage: React.FC = () => {
// 	const [mermaidCode, setMermaidCode] = useState<string>("");
// 	const diagramRef = useRef<HTMLDivElement>(null);

// 	// Initialize mermaid once
// 	useEffect(() => {
// 		mermaid.initialize({
// 			startOnLoad: false,
// 			theme: "default",
// 			flowchart: { curve: "linear" },
// 		});
// 	}, []);

// 	useEffect(() => {
// 		// Replace the complex AST parsing with a simpler approach
// 		const generateMermaidDiagram = () => {
// 			try {
// 				// Generate a static diagram for the Slack event flow since Skulpt AST parsing isn't working
// 				const mermaidCode = `
//   graph TD
// 	A["Receive Slack Event"] --> B{{"Determine Event Type"}}

// 	B -->|app_mention| C["on_slack_app_mention"]
// 	B -->|message| D["on_slack_message"]
// 	B -->|reaction_added| E["on_slack_reaction_added"]
// 	B -->|slash_command| F["on_slack_slash_command"]
// 	B -->|interaction| G["on_slack_interaction"]

// 	subgraph "on_slack_app_mention"
// 	  C1["Create Slack client"] --> C2["Send direct message"]
// 	  C2 --> C3["Post to #slack-test"]
// 	  C3 --> C4["Post temporary message"]
// 	  C4 --> C5["Wait 10 seconds"]
// 	  C5 --> C6["Update message"]
// 	  C6 --> C7["Post reply in thread"]
// 	  C7 --> C8["Wait 5 seconds"]
// 	  C8 --> C9["Update reply"]
// 	  C9 --> C10["Add reaction"]
// 	  C10 --> C11["Get conversation replies"]
// 	  C11 --> C12["Process replies"]
// 	end

// 	subgraph "on_slack_message"
// 	  D1["Create Slack client"] --> D2{{"Check subtype"}}
// 	  D2 -->|no subtype| D3{{"In thread?"}}
// 	  D3 -->|no| D4["_on_slack_new_message"]
// 	  D3 -->|yes| D5["_on_slack_reply_message"]
// 	  D2 -->|message_changed| D6["_on_slack_message_changed"]
// 	end

// 	subgraph "on_slack_reaction_added"
// 	  E1["Log user"] --> E2["Log reaction"]
// 	  E2 --> E3["Log item"]
// 	end

// 	subgraph "on_slack_slash_command"
// 	  F1["Create Slack client"] --> F2["Get user info"]
// 	  F2 --> F3["Send user ID"]
// 	  F3 --> F4["Send full name"]
// 	  F4 --> F5["Send email"]
// 	  F5 --> F6["Load approval message"]
// 	  F6 --> F7["Customize message"]
// 	  F7 --> F8["Send interactive message"]
// 	end

// 	subgraph "on_slack_interaction"
// 	  G1["Get action details"] --> G2["Extract origin"]
// 	  G2 --> G3{{"Check button style"}}
// 	  G3 -->|primary| G4["Add positive reaction"]
// 	  G3 -->|danger| G5["Add negative reaction"]
// 	  G4 --> G6["Send response"]
// 	  G5 --> G6
// 	  G3 --> G6
// 	end

// 	subgraph "_on_slack_new_message"
// 	  H1["Format message"] --> H2["Post message"]
// 	end

// 	subgraph "_on_slack_reply_message"
// 	  I1["Format reply"] --> I2["Post in thread"]
// 	end

// 	subgraph "_on_slack_message_changed"
// 	  J1["Extract old and new text"] --> J2["Format edit notification"]
// 	  J2 --> J3["Post in thread"]
// 	end
// 	  `;

// 				return mermaidCode;
// 			} catch (error) {
// 				console.error("Error generating diagram:", error);
// 				return 'graph TD\nA["Error: Unable to generate diagram"]';
// 			}
// 		};

// 		try {
// 			const mermaid = generateMermaidDiagram();
// 			setMermaidCode(mermaid);
// 		} catch (error) {
// 			console.error("Error setting Mermaid diagram:", error);
// 			setMermaidCode('graph TD\nA["Error: Unable to generate diagram"]');
// 		}
// 	}, []);

// 	useEffect(() => {
// 		if (mermaidCode && diagramRef.current) {
// 			try {
// 				// Clear previous diagram
// 				diagramRef.current.innerHTML = "";

// 				mermaid.render("mermaid-diagram", mermaidCode).then(({ svg }) => {
// 					if (diagramRef.current) {
// 						diagramRef.current.innerHTML = svg;
// 					}
// 				});
// 			} catch (error) {
// 				console.error("Failed to render diagram:", error);
// 			}
// 		}
// 	}, [mermaidCode]);

// 	return (
// 		<div>
// 			<h1>Slack Event Handling Activity Diagram</h1>
// 			{mermaidCode ? <Mermaid chart={mermaidCode} /> : <p>Generating diagram...</p>}
// 		</div>
// 	);
// };

// ~~~~

// import React, { useRef, useState, useEffect } from "react";

// import Editor from "@monaco-editor/react";
// import mermaid from "mermaid";

// export const WelcomePage: React.FC = () => {
// 	const [mermaidCode, setMermaidCode] = useState<string>("");
// 	const [isLoading, setIsLoading] = useState<boolean>(false);
// 	const [error, setError] = useState<string>("");
// 	const diagramRef = useRef<HTMLDivElement>(null);
// 	const editorRef = useRef<any>(null);
// 	const [pythonCode, setPythonCode] = useState<string>(
// 		`def example():
//     print("Hello world")
//     if condition:
//         do_something()
//     else:
//         do_something_else()
// `
// 	);

// 	// Initialize mermaid once
// 	useEffect(() => {
// 		mermaid.initialize({
// 			startOnLoad: false,
// 			theme: "default",
// 			flowchart: { curve: "linear" },
// 		});
// 	}, []);

// 	const handleEditorDidMount = (editor: any) => {
// 		editorRef.current = editor;
// 	};

// 	const convertToMermaid = async () => {
// 		setIsLoading(true);
// 		setError("");

// 		try {
// 			// Get the current value from Monaco editor
// 			const currentCode = editorRef.current.getValue();

// 			// Load Pyodide dynamically
// 			const { loadPyodide } = await import("pyodide");
// 			const pyodide = await loadPyodide();

// 			// Load the AST module
// 			await pyodide.loadPackagesFromImports("import ast");

// 			// Set the Python code as a global variable in Pyodide
// 			pyodide.globals.set("python_code", currentCode);

// 			// Run Python code that converts Python AST to Mermaid
// 			const result = await pyodide.runPythonAsync(`
// 	import ast

// 	def convert_python_to_mermaid(code):
// 		try:
// 			tree = ast.parse(code)
// 		except SyntaxError as e:
// 			return f"graph TD\\nA[Syntax Error: {str(e)}]"

// 		node_counter = 0
// 		nodes = {}

// 		def get_node_id(prefix):
// 			nonlocal node_counter
// 			node_counter += 1
// 			return f"{prefix}_{node_counter}"

// 		def get_node_label(node):
// 			if isinstance(node, ast.Call):
// 				if isinstance(node.func, ast.Name):
// 					return f"{node.func.id}()"
// 				elif isinstance(node.func, ast.Attribute):
// 					return f"{ast.unparse(node.func) if hasattr(ast, 'unparse') else 'method call'}"
// 				return "function call"
// 			elif isinstance(node, ast.Name):
// 				return node.id
// 			elif isinstance(node, ast.Constant):
// 				return str(node.value)
// 			else:
// 				return type(node).__name__

// 		mermaid = ["graph TD"]

// 		# Track parent relationships for when we skip nodes
// 		parent_child_map = {}

// 		def process_node(node, parent_id=None):
// 			# We'll only create nodes for functions, if statements, and function calls
// 			if isinstance(node, ast.FunctionDef):
// 				node_id = get_node_id("func")
// 				nodes[node_id] = node
// 				mermaid.append(f'{node_id}["Function: {node.name}"]')

// 				last_child_id = None
// 				for stmt in node.body:
// 					child_id = process_node(stmt, node_id)
// 					if child_id:
// 						last_child_id = child_id

// 				# Store relationship for later
// 				if parent_id and node_id:
// 					parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

// 				return node_id

// 			elif isinstance(node, ast.If):
// 				node_id = get_node_id("if")
// 				cond_text = ast.unparse(node.test) if hasattr(ast, 'unparse') else "condition"
// 				# Escape any quotes in the condition text for Mermaid
// 				cond_text = cond_text.replace('"', '\\\\"')
// 				mermaid.append(f'{node_id}{{"If: {cond_text}"}}')

// 				# True branch
// 				true_branch_nodes = []
// 				for stmt in node.body:
// 					child_id = process_node(stmt, node_id)
// 					if child_id:
// 						true_branch_nodes.append(child_id)

// 				# False branch
// 				false_branch_nodes = []
// 				if node.orelse:
// 					for stmt in node.orelse:
// 						child_id = process_node(stmt, node_id)
// 						if child_id:
// 							false_branch_nodes.append(child_id)

// 				# Connect condition to true branch
// 				if true_branch_nodes:
// 					for child_id in true_branch_nodes:
// 						mermaid.append(f"{node_id} -->|Yes| {child_id}")

// 				# Connect condition to false branch
// 				if false_branch_nodes:
// 					for child_id in false_branch_nodes:
// 						mermaid.append(f"{node_id} -->|No| {child_id}")
// 				elif node.orelse:
// 					# If we have else but no visible nodes there
// 					pass_id = get_node_id("else")
// 					mermaid.append(f'{pass_id}["..."]')
// 					mermaid.append(f"{node_id} -->|No| {pass_id}")

// 				# Store relationship for later
// 				if parent_id and node_id:
// 					parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

// 				return node_id

// 			elif isinstance(node, ast.Expr):
// 				if isinstance(node.value, ast.Call):
// 					node_id = get_node_id("call")
// 					call_text = ast.unparse(node.value) if hasattr(ast, 'unparse') else get_node_label(node.value)
// 					# Escape any quotes in the call text for Mermaid
// 					call_text = call_text.replace('"', '\\\\"')
// 					mermaid.append(f'{node_id}["{call_text}"]')

// 					# Store relationship for later
// 					if parent_id and node_id:
// 						parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

// 					return node_id

// 			# For other node types, we need to traverse them but not create nodes
// 			elif isinstance(node, ast.Assign) or isinstance(node, ast.AnnAssign):
// 				# Check if the right side has function calls we should extract
// 				if isinstance(node.value, ast.Call):
// 					node_id = get_node_id("call")
// 					call_text = ast.unparse(node.value) if hasattr(ast, 'unparse') else get_node_label(node.value)
// 					call_text = call_text.replace('"', '\\\\"')
// 					mermaid.append(f'{node_id}["{call_text}"]')

// 					if parent_id and node_id:
// 						parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [node_id]

// 					return node_id
// 				return None

// 			# Even though we skip these nodes, we need to traverse their children
// 			elif isinstance(node, (ast.For, ast.While)):
// 				result_nodes = []
// 				for stmt in node.body:
// 					child_id = process_node(stmt, parent_id)
// 					if child_id:
// 						result_nodes.append(child_id)
// 				return result_nodes[0] if result_nodes else None

// 			# Traverse other node types to find function calls and conditions
// 			else:
// 				# Recurse through any child nodes this might have
// 				for child in ast.iter_child_nodes(node):
// 					child_id = process_node(child, parent_id)
// 					if child_id and parent_id:
// 						parent_child_map[parent_id] = parent_child_map.get(parent_id, []) + [child_id]

// 			return None

// 		# Start processing from the top level of the AST
// 		last_node = None
// 		for node in tree.body:
// 			node_id = process_node(node)
// 			if node_id:
// 				if last_node:
// 					# Connect top-level nodes in sequence
// 					mermaid.append(f"{last_node} --> {node_id}")
// 				last_node = node_id

// 		# Process the parent-child relationships
// 		for parent, children in parent_child_map.items():
// 			for child in children:
// 				mermaid.append(f"{parent} --> {child}")

// 		return "\\n".join(mermaid)

// 	# Use the code passed from JavaScript
// 	convert_python_to_mermaid(python_code)
// 			`);

// 			setMermaidCode(result);
// 		} catch (error) {
// 			console.error("Error generating Mermaid diagram:", error);
// 			setError(`Error: ${error.message}`);
// 			setMermaidCode("graph TD\nA[Error: Unable to generate diagram]");
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	// Render diagram whenever mermaidCode changes
// 	useEffect(() => {
// 		if (mermaidCode && diagramRef.current) {
// 			try {
// 				// Clear previous diagram
// 				diagramRef.current.innerHTML = "";

// 				mermaid.render("mermaid-diagram", mermaidCode).then(({ svg }) => {
// 					if (diagramRef.current) {
// 						diagramRef.current.innerHTML = svg;
// 					}
// 				});
// 			} catch (error) {
// 				console.error("Failed to render diagram:", error);
// 				if (diagramRef.current) {
// 					diagramRef.current.innerHTML = '<div class="error">Diagram rendering failed</div>';
// 				}
// 			}
// 		}
// 	}, [mermaidCode]);

// 	return (
// 		<div className="space-y-4 p-4">
// 			<h1 className="text-xl font-semibold">Python to Mermaid Diagram Converter</h1>

// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Python Code</label>
// 				<div className="h-64 w-full rounded border">
// 					<Editor
// 						defaultValue={pythonCode}
// 						height="100%"
// 						language="python"
// 						onMount={handleEditorDidMount}
// 						options={{
// 							minimap: { enabled: false },
// 							scrollBeyondLastLine: false,
// 							fontSize: 14,
// 							wordWrap: "on",
// 							tabSize: 4,
// 							insertSpaces: true,
// 							detectIndentation: true,
// 						}}
// 					/>
// 				</div>
// 			</div>

// 			<div className="flex space-x-2">
// 				<button
// 					className="hover:bg-blue-600 disabled:bg-blue-300 rounded bg-blue-500 px-4 py-2 text-white"
// 					disabled={isLoading}
// 					onClick={convertToMermaid}
// 				>
// 					{isLoading ? "Converting..." : "Convert to Mermaid"}
// 				</button>

// 				{mermaidCode ? (
// 					<button
// 						className="rounded border px-4 py-2 hover:bg-gray-100"
// 						onClick={() => navigator.clipboard.writeText(mermaidCode)}
// 					>
// 						Copy Mermaid Code
// 					</button>
// 				) : null}
// 			</div>

// 			{error ? <div className="bg-red-50 border-red-200 text-red-700 rounded border p-3">{error}</div> : null}

// 			{mermaidCode ? (
// 				<div className="space-y-2">
// 					<h3 className="font-medium">Mermaid Diagram</h3>
// 					<div className="max-h-96 overflow-auto rounded border bg-white p-4" ref={diagramRef} />

// 					<div>
// 						<h3 className="font-medium">Mermaid Code</h3>
// 						<pre className="bg-gray-50 max-h-64 overflow-auto rounded border p-4 text-sm">
// 							{mermaidCode}
// 						</pre>
// 					</div>
// 				</div>
// 			) : null}
// 		</div>
// 	);
// };

// ~~~~~~~~~~~~~~~~~`

// import React, { useState, useRef, useEffect } from "react";

// import mermaid from "mermaid";

// export const PythonToMermaidConverter: React.FC = () => {
// 	const [pythonCode, setPythonCode] = useState<string>("");
// 	const [entrypoint, setEntrypoint] = useState<string>("");
// 	const [mermaidCode, setMermaidCode] = useState<string>("");
// 	const [isLoading, setIsLoading] = useState<boolean>(false);
// 	const [error, setError] = useState<string>("");
// 	const diagramRef = useRef<HTMLDivElement>(null);

// 	// Initialize mermaid once
// 	useEffect(() => {
// 		mermaid.initialize({
// 			startOnLoad: false,
// 			theme: "default",
// 			flowchart: { curve: "linear" },
// 		});
// 	}, []);

// 	// Render the diagram whenever mermaidCode changes
// 	useEffect(() => {
// 		if (mermaidCode && diagramRef.current) {
// 			try {
// 				diagramRef.current.innerHTML = "";
// 				mermaid.render("mermaid-diagram", mermaidCode).then(({ svg }) => {
// 					if (diagramRef.current) {
// 						diagramRef.current.innerHTML = svg;
// 					}
// 				});
// 			} catch (error) {
// 				console.error("Failed to render diagram:", error);
// 			}
// 		}
// 	}, [mermaidCode]);

// 	// Core conversion logic
// 	const convertToMermaid = async () => {
// 		setIsLoading(true);
// 		setError("");

// 		try {
// 			// Function to parse Python code and extract function information
// 			function parsePythonFunctions(code: string) {
// 				// Basic parsing to identify functions and their content
// 				const functionRegex = /def\s+([a-zA-Z0-9_]+)\s*\([^)]*\):/g;
// 				const functions: Record<string, { body: string; calls: string[] }> = {};

// 				// Find all function definitions
// 				let match;
// 				while ((match = functionRegex.exec(code)) !== null) {
// 					const functionName = match[1];
// 					const startPos = match.index;

// 					// Find the function body by tracking indentation
// 					let endPos = startPos;
// 					const depth = 0;
// 					let inBody = false;
// 					const lines = code.slice(startPos).split("\n");

// 					for (let i = 0; i < lines.length; i++) {
// 						const line = lines[i];
// 						if (i === 0) {
// 							// First line is the definition
// 							inBody = true;
// 							continue;
// 						}

// 						if (inBody) {
// 							if (line.trim() === "" || line.match(/^\s+/)) {
// 								// Still in the function body
// 								endPos += line.length + 1; // +1 for newline

// 								// Extract function calls
// 								const callMatches = line.match(/([a-zA-Z0-9_]+)\s*\([^)]*\)/g);
// 								if (callMatches) {
// 									for (const callMatch of callMatches) {
// 										const callName = callMatch.split("(")[0].trim();
// 										// Only consider functions that exist in our code
// 										if (code.includes(`def ${callName}`)) {
// 											if (!functions[functionName]) {
// 												functions[functionName] = { body: "", calls: [] };
// 											}
// 											if (!functions[functionName].calls.includes(callName)) {
// 												functions[functionName].calls.push(callName);
// 											}
// 										}
// 									}
// 								}
// 							} else {
// 								// No indentation means we're out of the function
// 								break;
// 							}
// 						}
// 					}

// 					functions[functionName] = {
// 						body: code.slice(startPos, endPos + 1),
// 						calls: functions[functionName]?.calls || [],
// 					};
// 				}

// 				return functions;
// 			}

// 			// Function to analyze a specific function body and extract its steps
// 			// ...existing code...
// 			function analyzeFunction(name: string, body: string): string[] {
// 				const steps: string[] = [];

// 				// Handle special start cases
// 				if (body.includes("_client") && body.match(/[a-zA-Z0-9_]+_client\s*\(/)) {
// 					steps.push("Create client");
// 				}

// 				// Generic patterns to detect
// 				const genericPatterns = [
// 					// Generic condition detection
// 					{
// 						regex: /if\s+([^:]+):/i,
// 						step: (match: RegExpMatchArray) => {
// 							// Simplify condition text to avoid Mermaid parsing issues
// 							let condition = match[1].trim();
// 							condition = condition.replace(/[\"\']/g, "");
// 							condition = condition.replace(/[+]/g, "plus");
// 							return `Check ${condition}`;
// 						},
// 					},
// 					// Time/sleep operations
// 					{
// 						regex: /time\.sleep\((\d+)\)/i,
// 						step: (match: RegExpMatchArray) => `Wait ${match[1]} seconds`,
// 					},
// 					// Print/logging
// 					{
// 						regex: /print\(([^)]+)\)/i,
// 						step: () => "Log output",
// 					},
// 					// Generic file operations
// 					{ regex: /\.read_text\(\)/i, step: "Read file" },
// 					{ regex: /\.write_text\(/i, step: "Write file" },
// 				];

// 				// Function call extraction
// 				const functionCallRegex = /([a-zA-Z0-9_\.]+)\s*\([^)]*\)/g;

// 				// Examine each line
// 				const lines = body.split("\n");
// 				for (const line of lines) {
// 					// First try specific patterns
// 					let foundPattern = false;
// 					for (const pattern of genericPatterns) {
// 						const match = line.match(pattern.regex);
// 						if (match) {
// 							if (typeof pattern.step === "function") {
// 								steps.push(pattern.step(match));
// 							} else {
// 								steps.push(pattern.step);
// 							}
// 							foundPattern = true;
// 							break;
// 						}
// 					}

// 					// If no specific pattern matched, look for function calls
// 					if (!foundPattern && !line.trim().startsWith("def ")) {
// 						const functionCalls = line.match(functionCallRegex);
// 						if (functionCalls) {
// 							for (const call of functionCalls) {
// 								// Extract method name
// 								let funcName = call.split("(")[0].trim();

// 								// Handle object methods
// 								if (funcName.includes(".")) {
// 									const parts = funcName.split(".");
// 									// Get last part as method name
// 									funcName = parts[parts.length - 1];
// 								}

// 								// Skip some common Python functions and methods
// 								if (
// 									["append", "join", "split", "strip", "format", "replace", "get"].includes(funcName)
// 								) {
// 									continue;
// 								}

// 								// Convert snake_case to Title Case for display
// 								const formattedName = funcName
// 									.split("_")
// 									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
// 									.join(" ");

// 								steps.push(formattedName);
// 							}
// 						}
// 					}
// 				}

// 				// If no specific steps were found, provide a generic step
// 				if (steps.length === 0) {
// 					steps.push(`Process in ${name}`);
// 				}

// 				// Remove duplicates (keeping order)
// 				const uniqueSteps = [...new Set(steps)];

// 				return uniqueSteps;
// 			}
// 			// ...existing code...

// 			// Generate Mermaid diagram code
// 			function generateMermaidDiagram(entrypoint: string, functions: Record<string, any>) {
// 				const nodes: string[] = [];
// 				const edges: string[] = [];
// 				const subgraphs: Record<string, string[]> = {};
// 				let nodeCounter = 1;

// 				// Create a mapping for node IDs
// 				const nodeMap: Record<string, Record<string, string>> = {};

// 				// Helper to get or create a node ID
// 				function getNodeId(func: string, step: string) {
// 					if (!nodeMap[func]) {
// 						nodeMap[func] = {};
// 					}
// 					if (!nodeMap[func][step]) {
// 						nodeMap[func][step] = `${func.charAt(0).toUpperCase()}${nodeCounter++}`;
// 					}
// 					return nodeMap[func][step];
// 				}

// 				// Helper to safely format node text
// 				function safeNodeText(text: string) {
// 					// Remove or replace problematic characters
// 					return text.replace(/"/g, "'").replace(/[+]/g, "plus").replace(/[<>]/g, "");
// 				}

// 				// Start with the main event flow
// 				nodes.push('A["Receive Event"] --> B{{"Determine Event Type"}}');

// 				// Add event type connections
// 				const eventHandlers = Object.keys(functions).filter((f) => f.startsWith("on_") || f === entrypoint);

// 				eventHandlers.forEach((handler) => {
// 					const eventType = handler.replace("on_", "");
// 					const handlerLetter = String.fromCharCode(67 + edges.length); // Start with C
// 					edges.push(`B -->|${eventType}| ${handlerLetter}["${handler}"]`);

// 					// Create subgraph for each handler
// 					if (!subgraphs[handler]) {
// 						subgraphs[handler] = [];
// 					}
// 				});

// 				// Process each function starting with the entry point
// 				function processFunction(funcName: string) {
// 					if (!functions[funcName]) return;

// 					const steps = analyzeFunction(funcName, functions[funcName].body);
// 					const subgraphNodes: string[] = [];

// 					// Create nodes for each step in this function
// 					for (let i = 0; i < steps.length; i++) {
// 						const step = steps[i];
// 						const nodeId = getNodeId(funcName, step);

// 						// Determine if this is a condition
// 						const isCondition = step.startsWith("Check");

// 						if (isCondition) {
// 							subgraphNodes.push(`${nodeId}{{"${safeNodeText(step)}"}}`);
// 						} else {
// 							subgraphNodes.push(`${nodeId}["${safeNodeText(step)}"]`);
// 						}

// 						// Connect steps
// 						if (i > 0) {
// 							const prevNodeId = getNodeId(funcName, steps[i - 1]);
// 							subgraphNodes.push(`${prevNodeId} --> ${nodeId}`);
// 						}
// 					}

// 					// Store in subgraphs
// 					if (!subgraphs[funcName]) {
// 						subgraphs[funcName] = [];
// 					}
// 					subgraphs[funcName] = subgraphs[funcName].concat(subgraphNodes);

// 					// Process called functions
// 					functions[funcName].calls.forEach(processFunction);
// 				}

// 				// Start processing with entry point
// 				processFunction(entrypoint);

// 				// Generate the final Mermaid code
// 				let result = "graph TD\n";
// 				result += nodes.join("\n\t") + "\n\n\t";
// 				result += edges.join("\n\t") + "\n\n";

// 				// Add subgraphs
// 				for (const [funcName, nodes] of Object.entries(subgraphs)) {
// 					if (nodes.length > 0) {
// 						result += `\tsubgraph "${funcName}"\n\t  `;
// 						result += nodes.join("\n\t  ");
// 						result += "\n\tend\n\n";
// 					}
// 				}

// 				return result;
// 			}

// 			// Main conversion logic
// 			if (!pythonCode.trim() || !entrypoint.trim()) {
// 				throw new Error("Please provide both Python code and an entrypoint function");
// 			}

// 			const functions = parsePythonFunctions(pythonCode);
// 			if (!functions[entrypoint]) {
// 				throw new Error(`Entry point '${entrypoint}' not found in the provided code`);
// 			}

// 			const diagram = generateMermaidDiagram(entrypoint, functions);
// 			setMermaidCode(diagram);
// 		} catch (error: any) {
// 			setError(`Error: ${error.message}`);
// 			console.error(error);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="space-y-4 p-4">
// 			<h1 className="mb-4 text-2xl font-bold">Python to Mermaid Flow Diagram Converter</h1>

// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Python Code</label>
// 				<textarea
// 					className="h-64 w-full rounded border p-2 font-mono text-sm"
// 					onChange={(e) => setPythonCode(e.target.value)}
// 					placeholder="Paste your Python code here..."
// 					value={pythonCode}
// 				/>
// 			</div>

// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Entry Point Function</label>
// 				<input
// 					className="w-full rounded border p-2 font-mono text-sm"
// 					onChange={(e) => setEntrypoint(e.target.value)}
// 					placeholder="e.g., on_slack_message"
// 					type="text"
// 					value={entrypoint}
// 				/>
// 			</div>

// 			<div className="flex space-x-2">
// 				<button
// 					className="hover:bg-blue-600 disabled:bg-blue-300 rounded bg-blue-500 px-4 py-2 text-white"
// 					disabled={isLoading || !pythonCode.trim() || !entrypoint.trim()}
// 					onClick={convertToMermaid}
// 				>
// 					{isLoading ? "Converting..." : "Generate Mermaid Diagram"}
// 				</button>

// 				{mermaidCode ? (
// 					<button
// 						className="rounded border px-4 py-2 hover:bg-gray-100"
// 						onClick={() => navigator.clipboard.writeText(mermaidCode)}
// 					>
// 						Copy Mermaid Code
// 					</button>
// 				) : null}
// 			</div>

// 			{error ? <div className="bg-red-50 border-red-200 text-red-700 rounded border p-3">{error}</div> : null}

// 			{mermaidCode ? (
// 				<div className="space-y-4">
// 					<div>
// 						<h3 className="text-lg font-medium">Mermaid Diagram</h3>
// 						<div className="max-h-1000 overflow-auto rounded border bg-white p-4" ref={diagramRef} />
// 					</div>

// 					<div>
// 						<h3 className="text-lg font-medium">Mermaid Code</h3>
// 						<pre className="bg-gray-50 max-h-64 overflow-auto rounded border p-4 text-sm">
// 							{mermaidCode}
// 						</pre>
// 					</div>
// 				</div>
// 			) : null}
// 		</div>
// 	);
// };

// const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
// 	const containerRef = useRef<HTMLDivElement>(null);

// 	useEffect(() => {
// 		if (containerRef.current && chart) {
// 			containerRef.current.innerHTML = "";
// 			mermaid
// 				.render("mermaid-diagram-" + Math.floor(Math.random() * 10000), chart)
// 				.then(({ svg }) => {
// 					if (containerRef.current) {
// 						containerRef.current.innerHTML = svg;
// 					}
// 				})
// 				.catch((error) => console.error("Mermaid rendering failed:", error));
// 		}
// 	}, [chart]);

// 	return <div className="mermaid-container" ref={containerRef} />;
// };

// export const WelcomePage: React.FC = () => {
// 	return (
// 		<div className="p-4">
// 			<h1 className="mb-6 text-2xl font-bold">Python to Mermaid Flow Diagram</h1>
// 			<PythonToMermaidConverter />
// 		</div>
// 	);
// };

/// ~~~~~~

// import React, { useState, useRef, useEffect } from "react";

// import mermaid from "mermaid";

// export const PythonToMermaidConverter: React.FC = () => {
// 	const [pythonCode, setPythonCode] = useState<string>("");
// 	const [entrypoint, setEntrypoint] = useState<string>("");
// 	const [mermaidCode, setMermaidCode] = useState<string>("");
// 	const [isLoading, setIsLoading] = useState<boolean>(false);
// 	const [error, setError] = useState<string>("");
// 	const diagramRef = useRef<HTMLDivElement>(null);

// 	// Initialize mermaid once
// 	useEffect(() => {
// 		mermaid.initialize({
// 			startOnLoad: false,
// 			theme: "default",
// 			flowchart: { curve: "linear" },
// 		});
// 	}, []);

// 	// Render the diagram whenever mermaidCode changes
// 	useEffect(() => {
// 		if (mermaidCode && diagramRef.current) {
// 			try {
// 				diagramRef.current.innerHTML = "";
// 				mermaid.render("mermaid-diagram", mermaidCode).then(({ svg }) => {
// 					if (diagramRef.current) {
// 						diagramRef.current.innerHTML = svg;
// 					}
// 				});
// 			} catch (error) {
// 				console.error("Failed to render diagram:", error);
// 			}
// 		}
// 	}, [mermaidCode]);

// 	// Core conversion logic
// 	const convertToMermaid = async () => {
// 		setIsLoading(true);
// 		setError("");

// 		try {
// 			// Function to parse Python code and extract function information
// 			function parsePythonFunctions(code: string) {
// 				// Basic parsing to identify functions and their content
// 				const functionRegex = /def\s+([a-zA-Z0-9_]+)\s*\([^)]*\):/g;
// 				const functions: Record<string, { body: string; calls: string[] }> = {};

// 				// Find all function definitions
// 				let match;
// 				while ((match = functionRegex.exec(code)) !== null) {
// 					const functionName = match[1];
// 					const startPos = match.index;

// 					// Find the function body by tracking indentation
// 					let endPos = startPos;
// 					const depth = 0;
// 					let inBody = false;
// 					const lines = code.slice(startPos).split("\n");

// 					for (let i = 0; i < lines.length; i++) {
// 						const line = lines[i];
// 						if (i === 0) {
// 							// First line is the definition
// 							inBody = true;
// 							continue;
// 						}

// 						if (inBody) {
// 							if (line.trim() === "" || line.match(/^\s+/)) {
// 								// Still in the function body
// 								endPos += line.length + 1; // +1 for newline

// 								// Extract function calls
// 								const callMatches = line.match(/([a-zA-Z0-9_]+)\s*\([^)]*\)/g);
// 								if (callMatches) {
// 									for (const callMatch of callMatches) {
// 										const callName = callMatch.split("(")[0].trim();
// 										// Only consider functions that exist in our code
// 										if (code.includes(`def ${callName}`)) {
// 											if (!functions[functionName]) {
// 												functions[functionName] = { body: "", calls: [] };
// 											}
// 											if (!functions[functionName].calls.includes(callName)) {
// 												functions[functionName].calls.push(callName);
// 											}
// 										}
// 									}
// 								}
// 							} else {
// 								// No indentation means we're out of the function
// 								break;
// 							}
// 						}
// 					}

// 					functions[functionName] = {
// 						body: code.slice(startPos, endPos + 1),
// 						calls: functions[functionName]?.calls || [],
// 					};
// 				}

// 				return functions;
// 			}

// 			// Function to analyze a specific function body and extract its steps
// 			// ...existing code...
// 			function analyzeFunction(name: string, body: string): string[] {
// 				const steps: string[] = [];

// 				// Handle special start cases
// 				if (body.includes("_client") && body.match(/[a-zA-Z0-9_]+_client\s*\(/)) {
// 					steps.push("Create client");
// 				}

// 				// Check for while True loop pattern in the entry function
// 				if (name === "on_http_get" && body.includes("while True:")) {
// 					steps.push("Start infinite loop");

// 					// Find function calls inside the loop
// 					const functionCallsInLoop = [];
// 					const lines = body.split("\n");
// 					let inLoop = false;

// 					for (const line of lines) {
// 						if (line.includes("while True:")) {
// 							inLoop = true;
// 							continue;
// 						}

// 						if (inLoop && line.trim() && !line.includes("time.sleep")) {
// 							const match = line.match(/\s+([a-zA-Z0-9_]+)\(/);
// 							if (match) {
// 								functionCallsInLoop.push(match[1]);
// 							}
// 						}
// 					}

// 					// Add the function calls as steps
// 					functionCallsInLoop.forEach((funcName) => {
// 						if (funcName !== "time") {
// 							// Skip the time module
// 							steps.push(`Call ${funcName}()`);
// 						}
// 					});

// 					// Look for sleep/wait patterns
// 					const sleepMatch = body.match(/time\.sleep\(([^)]+)\)/);
// 					if (sleepMatch) {
// 						steps.push(`Wait ${sleepMatch[1]} seconds`);
// 					}

// 					return steps;
// 				}

// 				// Generic patterns to detect
// 				const genericPatterns = [
// 					// Generic condition detection
// 					{
// 						regex: /if\s+([^:]+):/i,
// 						step: (match: RegExpMatchArray) => {
// 							// Create a simplified condition description
// 							const condition = match[1].trim();
// 							if (condition.includes("startswith")) {
// 								return "Check string prefix";
// 							} else if (condition.includes("<") || condition.includes(">")) {
// 								return "Check comparison";
// 							} else if (condition.includes("in")) {
// 								return "Check membership";
// 							} else if (condition.includes("not")) {
// 								return "Check negation";
// 							} else {
// 								return "Check condition";
// 							}
// 						},
// 					},
// 					// Time/sleep operations
// 					{
// 						regex: /time\.sleep\(([^)]+)\)/i,
// 						step: (match: RegExpMatchArray) => `Wait ${match[1]} seconds`,
// 					},
// 					// Print/logging
// 					{
// 						regex: /print\(([^)]+)\)/i,
// 						step: () => "Log output",
// 					},
// 					// While loops
// 					{
// 						regex: /while\s+([^:]+):/i,
// 						step: (match: RegExpMatchArray) => {
// 							if (match[1].trim() === "True") {
// 								return "Start infinite loop";
// 							}
// 							return "Start loop";
// 						},
// 					},
// 					// Return statements
// 					{
// 						regex: /return\s+([^#;]+)/i,
// 						step: () => "Return result",
// 					},
// 				];

// 				// Function call extraction - improved to better detect method calls
// 				const functionCallRegex = /(\w+(?:\.\w+)*)\s*\([^)]*\)/g;

// 				// Examine each line
// 				const lines = body.split("\n");
// 				for (const line of lines) {
// 					// Skip function definition lines
// 					if (line.trim().startsWith("def ")) continue;

// 					// First try specific patterns
// 					let foundPattern = false;
// 					for (const pattern of genericPatterns) {
// 						const match = line.match(pattern.regex);
// 						if (match) {
// 							if (typeof pattern.step === "function") {
// 								steps.push(pattern.step(match));
// 							} else {
// 								steps.push(pattern.step);
// 							}
// 							foundPattern = true;
// 							break;
// 						}
// 					}

// 					// If no specific pattern matched, look for function calls
// 					if (!foundPattern) {
// 						const functionCalls = line.match(functionCallRegex);
// 						if (functionCalls) {
// 							for (const call of functionCalls) {
// 								// Extract method name
// 								let funcName = call.split("(")[0].trim();

// 								// Handle object methods
// 								if (funcName.includes(".")) {
// 									const parts = funcName.split(".");
// 									// For Gmail and similar APIs, include both object and method
// 									if (["gmail", "slack", "users", "messages"].includes(parts[0])) {
// 										funcName = parts.slice(-2).join(".");
// 									} else {
// 										// Get last part as method name
// 										funcName = parts[parts.length - 1];
// 									}
// 								}

// 								// Skip common Python functions and methods
// 								if (
// 									[
// 										"append",
// 										"join",
// 										"split",
// 										"strip",
// 										"format",
// 										"replace",
// 										"get",
// 										"time",
// 										"sleep",
// 										"set",
// 										"update",
// 									].includes(funcName)
// 								) {
// 									continue;
// 								}

// 								// Convert snake_case to Title Case for display
// 								const formattedName = funcName
// 									.split("_")
// 									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
// 									.join(" ");

// 								steps.push(formattedName);
// 							}
// 						}
// 					}
// 				}

// 				// If no specific steps were found, provide a generic step
// 				if (steps.length === 0) {
// 					steps.push(`Process in ${name}`);
// 				}

// 				// Remove duplicates (keeping order)
// 				const uniqueSteps: string[] = [];
// 				for (const step of steps) {
// 					if (!uniqueSteps.includes(step)) {
// 						uniqueSteps.push(step);
// 					}
// 				}

// 				return uniqueSteps;
// 			}
// 			// ...existing code...

// 			// Generate Mermaid diagram code
// 			function generateMermaidDiagram(entrypoint: string, functions: Record<string, any>) {
// 				const nodes: string[] = [];
// 				const edges: string[] = [];
// 				const subgraphs: Record<string, string[]> = {};
// 				let nodeCounter = 1;

// 				// Create a mapping for node IDs
// 				const nodeMap: Record<string, Record<string, string>> = {};

// 				// Helper to get or create a node ID
// 				function getNodeId(func: string, step: string) {
// 					if (!nodeMap[func]) {
// 						nodeMap[func] = {};
// 					}
// 					if (!nodeMap[func][step]) {
// 						nodeMap[func][step] = `${func.charAt(0).toUpperCase()}${nodeCounter++}`;
// 					}
// 					return nodeMap[func][step];
// 				}

// 				// Helper to safely format node text
// 				function safeNodeText(text: string) {
// 					// Remove or replace problematic characters
// 					return text.replace(/"/g, "'").replace(/[+]/g, "plus").replace(/[<>]/g, "");
// 				}

// 				// Start with the main event flow
// 				nodes.push('A["Receive Event"] --> B{{"Determine Event Type"}}');

// 				// Add event type connections
// 				const eventHandlers = Object.keys(functions).filter((f) => f.startsWith("on_") || f === entrypoint);

// 				eventHandlers.forEach((handler) => {
// 					const eventType = handler.replace("on_", "");
// 					const handlerLetter = String.fromCharCode(67 + edges.length); // Start with C
// 					edges.push(`B -->|${eventType}| ${handlerLetter}["${handler}"]`);

// 					// Create subgraph for each handler
// 					if (!subgraphs[handler]) {
// 						subgraphs[handler] = [];
// 					}
// 				});

// 				// Process each function starting with the entry point
// 				function processFunction(funcName: string) {
// 					if (!functions[funcName]) return;

// 					const steps = analyzeFunction(funcName, functions[funcName].body);
// 					const subgraphNodes: string[] = [];

// 					// Create nodes for each step in this function
// 					for (let i = 0; i < steps.length; i++) {
// 						const step = steps[i];
// 						const nodeId = getNodeId(funcName, step);

// 						// Determine if this is a condition
// 						const isCondition = step.startsWith("Check");

// 						if (isCondition) {
// 							subgraphNodes.push(`${nodeId}{{"${safeNodeText(step)}"}}`);
// 						} else {
// 							subgraphNodes.push(`${nodeId}["${safeNodeText(step)}"]`);
// 						}

// 						// Connect steps
// 						if (i > 0) {
// 							const prevNodeId = getNodeId(funcName, steps[i - 1]);
// 							subgraphNodes.push(`${prevNodeId} --> ${nodeId}`);
// 						}
// 					}

// 					// Store in subgraphs
// 					if (!subgraphs[funcName]) {
// 						subgraphs[funcName] = [];
// 					}
// 					subgraphs[funcName] = subgraphs[funcName].concat(subgraphNodes);

// 					// Process called functions
// 					functions[funcName].calls.forEach(processFunction);
// 				}

// 				// Start processing with entry point
// 				processFunction(entrypoint);

// 				// Generate the final Mermaid code
// 				let result = "graph TD\n";
// 				result += nodes.join("\n\t") + "\n\n\t";
// 				result += edges.join("\n\t") + "\n\n";

// 				// Add subgraphs
// 				for (const [funcName, nodes] of Object.entries(subgraphs)) {
// 					if (nodes.length > 0) {
// 						result += `\tsubgraph "${funcName}"\n\t  `;
// 						result += nodes.join("\n\t  ");
// 						result += "\n\tend\n\n";
// 					}
// 				}

// 				return result;
// 			}

// 			// Main conversion logic
// 			if (!pythonCode.trim() || !entrypoint.trim()) {
// 				throw new Error("Please provide both Python code and an entrypoint function");
// 			}

// 			const functions = parsePythonFunctions(pythonCode);
// 			if (!functions[entrypoint]) {
// 				throw new Error(`Entry point '${entrypoint}' not found in the provided code`);
// 			}

// 			const diagram = generateMermaidDiagram(entrypoint, functions);
// 			setMermaidCode(diagram);
// 		} catch (error: any) {
// 			setError(`Error: ${error.message}`);
// 			console.error(error);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="space-y-4 p-4">
// 			<h1 className="mb-4 text-2xl font-bold">Python to Mermaid Flow Diagram Converter</h1>

// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Python Code</label>
// 				<textarea
// 					className="h-64 w-full rounded border p-2 font-mono text-sm"
// 					onChange={(e) => setPythonCode(e.target.value)}
// 					placeholder="Paste your Python code here..."
// 					value={pythonCode}
// 				/>
// 			</div>

// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Entry Point Function</label>
// 				<input
// 					className="w-full rounded border p-2 font-mono text-sm"
// 					onChange={(e) => setEntrypoint(e.target.value)}
// 					placeholder="e.g., on_slack_message"
// 					type="text"
// 					value={entrypoint}
// 				/>
// 			</div>

// 			<div className="flex space-x-2">
// 				<button
// 					className="hover:bg-blue-600 disabled:bg-blue-300 rounded bg-blue-500 px-4 py-2 text-white"
// 					disabled={isLoading || !pythonCode.trim() || !entrypoint.trim()}
// 					onClick={convertToMermaid}
// 				>
// 					{isLoading ? "Converting..." : "Generate Mermaid Diagram"}
// 				</button>

// 				{mermaidCode ? (
// 					<button
// 						className="rounded border px-4 py-2 hover:bg-gray-100"
// 						onClick={() => navigator.clipboard.writeText(mermaidCode)}
// 					>
// 						Copy Mermaid Code
// 					</button>
// 				) : null}
// 			</div>

// 			{error ? <div className="bg-red-50 border-red-200 text-red-700 rounded border p-3">{error}</div> : null}

// 			{mermaidCode ? (
// 				<div className="space-y-4">
// 					<div>
// 						<h3 className="text-lg font-medium">Mermaid Diagram</h3>
// 						<div className="max-h-1000 overflow-auto rounded border bg-white p-4" ref={diagramRef} />
// 					</div>

// 					<div>
// 						<h3 className="text-lg font-medium">Mermaid Code</h3>
// 						<pre className="bg-gray-50 max-h-64 overflow-auto rounded border p-4 text-sm">
// 							{mermaidCode}
// 						</pre>
// 					</div>
// 				</div>
// 			) : null}
// 		</div>
// 	);
// };

// export const WelcomePage: React.FC = () => {
// 	return (
// 		<div className="p-4">
// 			<h1 className="mb-6 text-2xl font-bold">Python to Mermaid Flow Diagram</h1>
// 			<PythonToMermaidConverter />
// 		</div>
// 	);
// };

/// ~~~~~~

// import React, { useState, useRef, useEffect } from "react";

// import mermaid from "mermaid";

// export const PythonToMermaidConverter: React.FC = () => {
// 	const [pythonCode, setPythonCode] = useState<string>("");
// 	const [entrypoint, setEntrypoint] = useState<string>("");
// 	const [mermaidCode, setMermaidCode] = useState<string>("");
// 	const [isLoading, setIsLoading] = useState<boolean>(false);
// 	const [error, setError] = useState<string>("");
// 	const diagramRef = useRef<HTMLDivElement>(null);

// 	// Initialize mermaid once
// 	useEffect(() => {
// 		mermaid.initialize({
// 			startOnLoad: false,
// 			theme: "default",
// 			flowchart: { curve: "linear" },
// 		});
// 	}, []);

// 	// Render the diagram whenever mermaidCode changes
// 	useEffect(() => {
// 		if (mermaidCode && diagramRef.current) {
// 			try {
// 				diagramRef.current.innerHTML = "";
// 				mermaid.render("mermaid-diagram", mermaidCode).then(({ svg }) => {
// 					if (diagramRef.current) {
// 						diagramRef.current.innerHTML = svg;
// 					}
// 				});
// 			} catch (error) {
// 				console.error("Failed to render diagram:", error);
// 			}
// 		}
// 	}, [mermaidCode]);

// 	// Core conversion logic
// 	const convertToMermaid = async () => {
// 		setIsLoading(true);
// 		setError("");

// 		try {
// 			// Function to parse Python code and extract function information
// 			function parsePythonFunctions(code: string) {
// 				// Basic parsing to identify functions and their content
// 				const functionRegex = /def\s+([a-zA-Z0-9_]+)\s*\([^)]*\):/g;
// 				const functions: Record<string, { body: string; calls: string[] }> = {};

// 				// Find all function definitions
// 				let match;
// 				while ((match = functionRegex.exec(code)) !== null) {
// 					const functionName = match[1];
// 					const startPos = match.index;

// 					// Find the function body by tracking indentation
// 					let endPos = startPos;
// 					const depth = 0;
// 					let inBody = false;
// 					const lines = code.slice(startPos).split("\n");

// 					for (let i = 0; i < lines.length; i++) {
// 						const line = lines[i];
// 						if (i === 0) {
// 							// First line is the definition
// 							inBody = true;
// 							continue;
// 						}

// 						if (inBody) {
// 							if (line.trim() === "" || line.match(/^\s+/)) {
// 								// Still in the function body
// 								endPos += line.length + 1; // +1 for newline

// 								// Extract function calls
// 								const callMatches = line.match(/([a-zA-Z0-9_]+)\s*\([^)]*\)/g);
// 								if (callMatches) {
// 									for (const callMatch of callMatches) {
// 										const callName = callMatch.split("(")[0].trim();
// 										// Only consider functions that exist in our code
// 										if (code.includes(`def ${callName}`)) {
// 											if (!functions[functionName]) {
// 												functions[functionName] = { body: "", calls: [] };
// 											}
// 											if (!functions[functionName].calls.includes(callName)) {
// 												functions[functionName].calls.push(callName);
// 											}
// 										}
// 									}
// 								}
// 							} else {
// 								// No indentation means we're out of the function
// 								break;
// 							}
// 						}
// 					}

// 					functions[functionName] = {
// 						body: code.slice(startPos, endPos + 1),
// 						calls: functions[functionName]?.calls || [],
// 					};
// 				}

// 				return functions;
// 			}

// 			// Function to analyze a specific function body and extract its steps
// 			// ...existing code...
// 			function analyzeFunction(name: string, body: string): { calls: string[]; steps: string[] } {
// 				const steps: string[] = [];
// 				const calls: string[] = [];

// 				// Handle client creation if present
// 				if (body.includes("_client") && body.match(/[a-zA-Z0-9_]+_client\s*\(/)) {
// 					steps.push("Create client");
// 				}

// 				// Check for while True loop pattern
// 				if (body.includes("while True:")) {
// 					steps.push("Start infinite loop");
// 				}

// 				// Function call extraction - preserve the exact function names
// 				const functionCallRegex = /([a-zA-Z0-9_]+)\s*\([^)]*\)/g;

// 				// Examine each line
// 				const lines = body.split("\n");
// 				for (const line of lines) {
// 					// Skip function definition lines
// 					if (line.trim().startsWith("def ")) continue;

// 					// Extract and track function calls
// 					const functionCalls = line.match(functionCallRegex);
// 					if (functionCalls) {
// 						for (const call of functionCalls) {
// 							const funcName = call.split("(")[0].trim();

// 							// Skip some common Python functions
// 							if (
// 								[
// 									"time",
// 									"print",
// 									"set",
// 									"get",
// 									"append",
// 									"update",
// 									"join",
// 									"split",
// 									"strip",
// 									"format",
// 									"replace",
// 								].includes(funcName)
// 							) {
// 								continue;
// 							}

// 							// Add the actual function call to steps
// 							steps.push(funcName);

// 							// Track called functions for linking
// 							if (!calls.includes(funcName)) {
// 								calls.push(funcName);
// 							}
// 						}
// 					}

// 					// Add specific patterns that aren't function calls
// 					if (line.includes("time.sleep")) {
// 						const sleepMatch = line.match(/time\.sleep\(([^)]+)\)/);
// 						if (sleepMatch) {
// 							steps.push(`Wait ${sleepMatch[1]} seconds`);
// 						}
// 					}

// 					if (line.includes("print(")) {
// 						steps.push("Log output");
// 					}

// 					if (line.match(/if\s+([^:]+):/)) {
// 						steps.push("Check condition");
// 					}

// 					if (line.match(/return\s+/)) {
// 						steps.push("Return result");
// 					}
// 				}

// 				// If no steps were found, provide a generic step
// 				if (steps.length === 0) {
// 					steps.push(`Process in ${name}`);
// 				}

// 				// Remove duplicates while preserving order
// 				const uniqueSteps: string[] = [];
// 				for (const step of steps) {
// 					if (!uniqueSteps.includes(step)) {
// 						uniqueSteps.push(step);
// 					}
// 				}

// 				return { steps: uniqueSteps, calls };
// 			}

// 			function generateMermaidDiagram(entrypoint: string, functions: Record<string, any>) {
// 				const nodes: string[] = [];
// 				const edges: string[] = [];
// 				const subgraphs: Record<string, string[]> = {};
// 				let nodeCounter = 1;

// 				// Direct function connections (from caller to callee)
// 				const functionConnections: [string, string][] = [];

// 				// Create a mapping for node IDs
// 				const nodeMap: Record<string, Record<string, string>> = {};

// 				// Helper to get or create a node ID
// 				function getNodeId(func: string, step: string) {
// 					if (!nodeMap[func]) {
// 						nodeMap[func] = {};
// 					}
// 					if (!nodeMap[func][step]) {
// 						nodeMap[func][step] = `${func.charAt(0).toUpperCase()}${nodeCounter++}`;
// 					}
// 					return nodeMap[func][step];
// 				}

// 				// Helper to safely format node text
// 				function safeNodeText(text: string) {
// 					// Remove or replace problematic characters
// 					return text.replace(/"/g, "'").replace(/[+]/g, "plus").replace(/[<>]/g, "");
// 				}

// 				// Start with the main event flow
// 				nodes.push('A["Receive Event"] --> B{{"Determine Event Type"}}');

// 				// Add event type connections
// 				const eventHandlers = Object.keys(functions).filter((f) => f.startsWith("on_") || f === entrypoint);

// 				eventHandlers.forEach((handler) => {
// 					const eventType = handler.replace("on_", "");
// 					const handlerLetter = String.fromCharCode(67 + edges.length); // Start with C
// 					edges.push(`B -->|${eventType}| ${handlerLetter}["${handler}"]`);

// 					// Create subgraph for each handler
// 					if (!subgraphs[handler]) {
// 						subgraphs[handler] = [];
// 					}
// 				});

// 				// Process each function
// 				function processFunction(funcName: string, visited = new Set()) {
// 					if (!functions[funcName] || visited.has(funcName)) return;
// 					visited.add(funcName);

// 					// Analyze the function to get steps and call info
// 					const analysis = analyzeFunction(funcName, functions[funcName].body);
// 					const steps = analysis.steps;
// 					const calls = analysis.calls;

// 					const subgraphNodes: string[] = [];

// 					// Create nodes for each step
// 					for (let i = 0; i < steps.length; i++) {
// 						const step = steps[i];
// 						const nodeId = getNodeId(funcName, step);

// 						// Check if step is also a function name that exists in our code
// 						if (functions[step]) {
// 							// Add to function connections for later
// 							functionConnections.push([funcName, step]);
// 						}

// 						// Determine node shape based on step type
// 						const isCondition = step === "Check condition";
// 						const isLoop = step.includes("loop");

// 						if (isCondition) {
// 							subgraphNodes.push(`${nodeId}{{"${safeNodeText(step)}"}}`);
// 						} else if (isLoop) {
// 							subgraphNodes.push(`${nodeId}{{{"${safeNodeText(step)}"}}}}`);
// 						} else {
// 							subgraphNodes.push(`${nodeId}["${safeNodeText(step)}"]`);
// 						}

// 						// Connect steps within the function
// 						if (i > 0) {
// 							const prevNodeId = getNodeId(funcName, steps[i - 1]);
// 							subgraphNodes.push(`${prevNodeId} --> ${nodeId}`);
// 						}
// 					}

// 					// Store in subgraphs
// 					if (!subgraphs[funcName]) {
// 						subgraphs[funcName] = [];
// 					}
// 					subgraphs[funcName] = subgraphs[funcName].concat(subgraphNodes);

// 					// Process called functions
// 					calls.forEach((calledFunc) => {
// 						if (functions[calledFunc]) {
// 							processFunction(calledFunc, visited);
// 						}
// 					});
// 				}

// 				// Start processing with entry point
// 				processFunction(entrypoint);

// 				// Add direct connections between functions
// 				functionConnections.forEach(([caller, callee]) => {
// 					// Get the last node of the caller function
// 					const callerAnalysis = analyzeFunction(caller, functions[caller].body);
// 					const callerLastStep = callerAnalysis.steps[callerAnalysis.steps.length - 1];
// 					const callerLastNodeId = getNodeId(caller, callerLastStep);

// 					// Get the first node of the called function
// 					const calleeAnalysis = analyzeFunction(callee, functions[callee].body);
// 					if (calleeAnalysis.steps.length > 0) {
// 						const calleeFirstStep = calleeAnalysis.steps[0];
// 						const calleeFirstNodeId = getNodeId(callee, calleeFirstStep);

// 						// Add connection from caller to callee
// 						edges.push(`${callerLastNodeId} --> ${calleeFirstNodeId}`);
// 					}
// 				});

// 				// Generate the final Mermaid code
// 				let result = "graph TD\n";
// 				result += nodes.join("\n\t") + "\n\n\t";
// 				result += edges.join("\n\t") + "\n\n";

// 				// Add subgraphs
// 				for (const [funcName, nodes] of Object.entries(subgraphs)) {
// 					if (nodes.length > 0) {
// 						result += `\tsubgraph "${funcName}"\n\t  `;
// 						result += nodes.join("\n\t  ");
// 						result += "\n\tend\n\n";
// 					}
// 				}

// 				return result;
// 			}

// 			// Main conversion logic
// 			if (!pythonCode.trim() || !entrypoint.trim()) {
// 				throw new Error("Please provide both Python code and an entrypoint function");
// 			}

// 			const functions = parsePythonFunctions(pythonCode);
// 			if (!functions[entrypoint]) {
// 				throw new Error(`Entry point '${entrypoint}' not found in the provided code`);
// 			}

// 			const diagram = generateMermaidDiagram(entrypoint, functions);
// 			setMermaidCode(diagram);
// 		} catch (error: any) {
// 			setError(`Error: ${error.message}`);
// 			console.error(error);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="space-y-4 p-4">
// 			<h1 className="mb-4 text-2xl font-bold">Python to Mermaid Flow Diagram Converter</h1>

// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Python Code</label>
// 				<textarea
// 					className="h-64 w-full rounded border p-2 font-mono text-sm"
// 					onChange={(e) => setPythonCode(e.target.value)}
// 					placeholder="Paste your Python code here..."
// 					value={pythonCode}
// 				/>
// 			</div>

// 			<div>
// 				<label className="mb-1 block text-sm font-medium text-gray-700">Entry Point Function</label>
// 				<input
// 					className="w-full rounded border p-2 font-mono text-sm"
// 					onChange={(e) => setEntrypoint(e.target.value)}
// 					placeholder="e.g., on_slack_message"
// 					type="text"
// 					value={entrypoint}
// 				/>
// 			</div>

// 			<div className="flex space-x-2">
// 				<button
// 					className="hover:bg-blue-600 disabled:bg-blue-300 rounded bg-blue-500 px-4 py-2 text-white"
// 					disabled={isLoading || !pythonCode.trim() || !entrypoint.trim()}
// 					onClick={convertToMermaid}
// 				>
// 					{isLoading ? "Converting..." : "Generate Mermaid Diagram"}
// 				</button>

// 				{mermaidCode ? (
// 					<button
// 						className="rounded border px-4 py-2 hover:bg-gray-100"
// 						onClick={() => navigator.clipboard.writeText(mermaidCode)}
// 					>
// 						Copy Mermaid Code
// 					</button>
// 				) : null}
// 			</div>

// 			{error ? <div className="bg-red-50 border-red-200 text-red-700 rounded border p-3">{error}</div> : null}

// 			{mermaidCode ? (
// 				<div className="space-y-4">
// 					<div>
// 						<h3 className="text-lg font-medium">Mermaid Diagram</h3>
// 						<div className="max-h-1000 overflow-auto rounded border bg-white p-4" ref={diagramRef} />
// 					</div>

// 					<div>
// 						<h3 className="text-lg font-medium">Mermaid Code</h3>
// 						<pre className="bg-gray-50 max-h-64 overflow-auto rounded border p-4 text-sm">
// 							{mermaidCode}
// 						</pre>
// 					</div>
// 				</div>
// 			) : null}
// 		</div>
// 	);
// };

// export const WelcomePage: React.FC = () => {
// 	return (
// 		<div className="p-4">
// 			<h1 className="mb-6 text-2xl font-bold">Python to Mermaid Flow Diagram</h1>
// 			<PythonToMermaidConverter />
// 		</div>
// 	);
// };

/// ~~~~~~

import React, { useState, useRef, useEffect } from "react";

import mermaid from "mermaid";

export const PythonToMermaidConverter: React.FC = () => {
	const [pythonCode, setPythonCode] = useState<string>("");
	const [entrypoint, setEntrypoint] = useState<string>("");
	const [mermaidCode, setMermaidCode] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const diagramRef = useRef<HTMLDivElement>(null);

	// Initialize mermaid once
	useEffect(() => {
		mermaid.initialize({
			startOnLoad: false,
			theme: "default",
			flowchart: { curve: "linear" },
		});
	}, []);

	// Render the diagram whenever mermaidCode changes
	useEffect(() => {
		if (mermaidCode && diagramRef.current) {
			try {
				diagramRef.current.innerHTML = "";
				mermaid.render("mermaid-diagram", mermaidCode).then(({ svg }) => {
					if (diagramRef.current) {
						diagramRef.current.innerHTML = svg;
					}
				});
			} catch (error) {
				console.error("Failed to render diagram:", error);
			}
		}
	}, [mermaidCode]);

	// Core conversion logic
	const convertToMermaid = async () => {
		setIsLoading(true);
		setError("");

		try {
			// Function to parse Python code and extract function information
			function parsePythonFunctions(code: string) {
				// Basic parsing to identify functions and their content
				const functionRegex = /def\s+([a-zA-Z0-9_]+)\s*\([^)]*\):/g;
				const functions: Record<string, { body: string; calls: string[] }> = {};

				// Find all function definitions
				let match;
				while ((match = functionRegex.exec(code)) !== null) {
					const functionName = match[1];
					const startPos = match.index;

					// Find the function body by tracking indentation
					let endPos = startPos;
					const depth = 0;
					let inBody = false;
					const lines = code.slice(startPos).split("\n");

					for (let i = 0; i < lines.length; i++) {
						const line = lines[i];
						if (i === 0) {
							// First line is the definition
							inBody = true;
							continue;
						}

						if (inBody) {
							if (line.trim() === "" || line.match(/^\s+/)) {
								// Still in the function body
								endPos += line.length + 1; // +1 for newline

								// Extract function calls
								const callMatches = line.match(/([a-zA-Z0-9_]+)\s*\([^)]*\)/g);
								if (callMatches) {
									for (const callMatch of callMatches) {
										const callName = callMatch.split("(")[0].trim();
										// Only consider functions that exist in our code
										if (code.includes(`def ${callName}`)) {
											if (!functions[functionName]) {
												functions[functionName] = { body: "", calls: [] };
											}
											if (!functions[functionName].calls.includes(callName)) {
												functions[functionName].calls.push(callName);
											}
										}
									}
								}
							} else {
								// No indentation means we're out of the function
								break;
							}
						}
					}

					functions[functionName] = {
						body: code.slice(startPos, endPos + 1),
						calls: functions[functionName]?.calls || [],
					};
				}

				return functions;
			}

			// Function to analyze a specific function body and extract its steps
			// ...existing code...
			function analyzeFunction(name: string, body: string): { calls: string[]; steps: string[] } {
				const steps: string[] = [];
				const calls: string[] = [];

				// Handle client creation if present
				if (body.includes("_client") && body.match(/[a-zA-Z0-9_]+_client\s*\(/)) {
					steps.push("Create client");
				}

				// Check for while True loop pattern
				if (body.includes("while True:")) {
					steps.push("Start infinite loop");
				}

				// Function call extraction - preserve the exact function names
				const functionCallRegex = /([a-zA-Z0-9_]+)\s*\([^)]*\)/g;

				// Examine each line
				const lines = body.split("\n");
				for (const line of lines) {
					// Skip function definition lines
					if (line.trim().startsWith("def ")) continue;

					// Extract and track function calls
					const functionCalls = line.match(functionCallRegex);
					if (functionCalls) {
						for (const call of functionCalls) {
							const funcName = call.split("(")[0].trim();

							// Skip some common Python functions
							if (
								[
									"time",
									"print",
									"set",
									"get",
									"append",
									"update",
									"join",
									"split",
									"strip",
									"format",
									"replace",
								].includes(funcName)
							) {
								continue;
							}

							// Add the actual function call to steps
							steps.push(funcName);

							// Track called functions for linking
							if (!calls.includes(funcName)) {
								calls.push(funcName);
							}
						}
					}

					// Add specific patterns that aren't function calls
					if (line.includes("time.sleep")) {
						const sleepMatch = line.match(/time\.sleep\(([^)]+)\)/);
						if (sleepMatch) {
							steps.push(`Wait ${sleepMatch[1]} seconds`);
						}
					}

					if (line.includes("print(")) {
						steps.push("Log output");
					}

					if (line.match(/if\s+([^:]+):/)) {
						steps.push("Check condition");
					}

					if (line.match(/return\s+/)) {
						steps.push("Return result");
					}
				}

				// If no steps were found, provide a generic step
				if (steps.length === 0) {
					steps.push(`Process in ${name}`);
				}

				// Remove duplicates while preserving order
				const uniqueSteps: string[] = [];
				for (const step of steps) {
					if (!uniqueSteps.includes(step)) {
						uniqueSteps.push(step);
					}
				}

				return { steps: uniqueSteps, calls };
			}
			// ...existing code...
			function generateMermaidDiagram(entrypoint: string, functions: Record<string, any>) {
				const nodes: string[] = [];
				const edges: string[] = [];
				const subgraphs: Record<string, string[]> = {};
				let nodeCounter = 1;

				// Direct function connections (from caller to callee)
				const functionConnections: [string, string][] = [];

				// Create a mapping for node IDs
				const nodeMap: Record<string, Record<string, string>> = {};

				// Helper to get or create a node ID
				function getNodeId(func: string, step: string) {
					if (!nodeMap[func]) {
						nodeMap[func] = {};
					}
					if (!nodeMap[func][step]) {
						nodeMap[func][step] = `${func.charAt(0).toUpperCase()}${nodeCounter++}`;
					}
					return nodeMap[func][step];
				}

				// Helper to safely format node text
				function safeNodeText(text: string) {
					// Remove or replace problematic characters
					return text.replace(/"/g, "'").replace(/[+]/g, "plus").replace(/[<>]/g, "");
				}

				// Start with the main event flow
				nodes.push('A["Receive Event"] --> B{{"Determine Event Type"}}');

				// Add event type connections
				const eventHandlers = Object.keys(functions).filter((f) => f.startsWith("on_") || f === entrypoint);

				eventHandlers.forEach((handler) => {
					const eventType = handler.replace("on_", "");
					const handlerLetter = String.fromCharCode(67 + edges.length); // Start with C
					edges.push(`B -->|${eventType}| ${handlerLetter}["${handler}"]`);

					// Create subgraph for each handler
					if (!subgraphs[handler]) {
						subgraphs[handler] = [];
					}
				});

				// Process each function
				function processFunction(funcName: string, visited = new Set()) {
					if (!functions[funcName] || visited.has(funcName)) return;
					visited.add(funcName);

					// Analyze the function to get steps and call info
					const analysis = analyzeFunction(funcName, functions[funcName].body);
					const steps = analysis.steps;
					const calls = analysis.calls;

					const subgraphNodes: string[] = [];

					// Create nodes for each step
					for (let i = 0; i < steps.length; i++) {
						const step = steps[i];
						const nodeId = getNodeId(funcName, step);

						// Check if step is also a function name that exists in our code
						if (functions[step]) {
							// Add to function connections for later
							functionConnections.push([funcName, step]);
						}

						// Determine node shape based on step type
						const isCondition = step === "Check condition";
						const isLoop = step.includes("loop");

						if (isCondition) {
							subgraphNodes.push(`${nodeId}{{"${safeNodeText(step)}"}}`);
						} else if (isLoop) {
							// Fix: Use hexagon shape with proper syntax
							subgraphNodes.push(`${nodeId}[["${safeNodeText(step)}"]]`);
						} else {
							subgraphNodes.push(`${nodeId}["${safeNodeText(step)}"]`);
						}

						// Connect steps within the function
						if (i > 0) {
							const prevNodeId = getNodeId(funcName, steps[i - 1]);
							subgraphNodes.push(`${prevNodeId} --> ${nodeId}`);
						}
					}

					// Store in subgraphs
					if (!subgraphs[funcName]) {
						subgraphs[funcName] = [];
					}
					subgraphs[funcName] = subgraphs[funcName].concat(subgraphNodes);

					// Process called functions
					calls.forEach((calledFunc) => {
						if (functions[calledFunc]) {
							processFunction(calledFunc, visited);
						}
					});
				}

				// Start processing with entry point
				processFunction(entrypoint);

				// Add direct connections between functions
				functionConnections.forEach(([caller, callee]) => {
					// Get the last node of the caller function
					const callerAnalysis = analyzeFunction(caller, functions[caller].body);
					const callerLastStep = callerAnalysis.steps[callerAnalysis.steps.length - 1];
					const callerLastNodeId = getNodeId(caller, callerLastStep);

					// Get the first node of the called function
					const calleeAnalysis = analyzeFunction(callee, functions[callee].body);
					if (calleeAnalysis.steps.length > 0) {
						const calleeFirstStep = calleeAnalysis.steps[0];
						const calleeFirstNodeId = getNodeId(callee, calleeFirstStep);

						// Add connection from caller to callee
						edges.push(`${callerLastNodeId} --> ${calleeFirstNodeId}`);
					}
				});

				// Generate the final Mermaid code
				let result = "graph TD\n";
				result += nodes.join("\n\t") + "\n\n\t";
				result += edges.join("\n\t") + "\n\n";

				// Add subgraphs
				for (const [funcName, nodes] of Object.entries(subgraphs)) {
					if (nodes.length > 0) {
						result += `\tsubgraph "${funcName}"\n\t  `;
						result += nodes.join("\n\t  ");
						result += "\n\tend\n\n";
					}
				}

				return result;
			}

			// Main conversion logic
			if (!pythonCode.trim() || !entrypoint.trim()) {
				throw new Error("Please provide both Python code and an entrypoint function");
			}

			const functions = parsePythonFunctions(pythonCode);
			if (!functions[entrypoint]) {
				throw new Error(`Entry point '${entrypoint}' not found in the provided code`);
			}

			const diagram = generateMermaidDiagram(entrypoint, functions);
			setMermaidCode(diagram);
		} catch (error: any) {
			setError(`Error: ${error.message}`);
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4 p-4">
			<h1 className="mb-4 text-2xl font-bold">Python to Mermaid Flow Diagram Converter</h1>

			<div>
				<label className="mb-1 block text-sm font-medium text-gray-700">Python Code</label>
				<textarea
					className="h-64 w-full rounded border p-2 font-mono text-sm"
					onChange={(e) => setPythonCode(e.target.value)}
					placeholder="Paste your Python code here..."
					value={pythonCode}
				/>
			</div>

			<div>
				<label className="mb-1 block text-sm font-medium text-gray-700">Entry Point Function</label>
				<input
					className="w-full rounded border p-2 font-mono text-sm"
					onChange={(e) => setEntrypoint(e.target.value)}
					placeholder="e.g., on_slack_message"
					type="text"
					value={entrypoint}
				/>
			</div>

			<div className="flex space-x-2">
				<button
					className="hover:bg-blue-600 disabled:bg-blue-300 rounded bg-blue-500 px-4 py-2 text-white"
					disabled={isLoading || !pythonCode.trim() || !entrypoint.trim()}
					onClick={convertToMermaid}
				>
					{isLoading ? "Converting..." : "Generate Mermaid Diagram"}
				</button>

				{mermaidCode ? (
					<button
						className="rounded border px-4 py-2 hover:bg-gray-100"
						onClick={() => navigator.clipboard.writeText(mermaidCode)}
					>
						Copy Mermaid Code
					</button>
				) : null}
			</div>

			{error ? <div className="bg-red-50 border-red-200 text-red-700 rounded border p-3">{error}</div> : null}

			{mermaidCode ? (
				<div className="space-y-4">
					<div>
						<h3 className="text-lg font-medium">Mermaid Diagram</h3>
						<div className="max-h-1000 overflow-auto rounded border bg-white p-4" ref={diagramRef} />
					</div>

					<div>
						<h3 className="text-lg font-medium">Mermaid Code</h3>
						<pre className="bg-gray-50 max-h-64 overflow-auto rounded border p-4 text-sm">
							{mermaidCode}
						</pre>
					</div>
				</div>
			) : null}
		</div>
	);
};

export const WelcomePage: React.FC = () => {
	return (
		<div className="p-4">
			<h1 className="mb-6 text-2xl font-bold">Python to Mermaid Flow Diagram</h1>
			<PythonToMermaidConverter />
		</div>
	);
};
