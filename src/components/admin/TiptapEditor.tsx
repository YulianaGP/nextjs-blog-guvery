"use client";

// Importaciones de Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
// StarterKit es un paquete con las extensiones más comunes ya configuradas:
// Bold, Italic, Heading (H1-H6), BulletList, OrderedList, Code, Blockquote, etc.
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

type Props = {
  // Contenido HTML inicial (viene del post existente si es edición)
  defaultValue?: string;
};

export function TiptapEditor({ defaultValue = "" }: Props) {
  // Estado local que sincroniza el HTML del editor con el textarea oculto
  const [html, setHtml] = useState(defaultValue);

  // useEditor inicializa Tiptap con las extensiones y el contenido inicial
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Desactivamos heading level 1 para que los artículos tengan una
        // jerarquía coherente (el título del post es el H1 de la página)
        heading: { levels: [2, 3, 4] },
      }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    // onUpdate se dispara cada vez que el usuario escribe o borra algo
    onUpdate({ editor }) {
      // getHTML() devuelve el contenido como string HTML
      setHtml(editor.getHTML());
    },
    // Clases Tailwind para el área editable
    editorProps: {
      attributes: {
        class:
          "min-h-[350px] p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert",
      },
    },
  });

  // Si el componente recibe un nuevo defaultValue después del montado
  // (por ejemplo al navegar entre rutas), sincronizamos el contenido
  useEffect(() => {
    if (editor && defaultValue !== editor.getHTML()) {
      editor.commands.setContent(defaultValue);
      setHtml(defaultValue);
    }
  }, [defaultValue, editor]);

  return (
    <div className="rounded-lg border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
      {/* ── Barra de herramientas ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 border-b border-stroke p-2 dark:border-dark-3">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          title="Negrita"
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          title="Cursiva"
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive("heading", { level: 2 })}
          title="Título H2"
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive("heading", { level: 3 })}
          title="Título H3"
        >
          H3
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          title="Lista con viñetas"
        >
          • Lista
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          title="Lista numerada"
        >
          1. Lista
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
          title="Cita"
        >
          &ldquo; Cita
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          active={editor?.isActive("code")}
          title="Código inline"
        >
          {"</>"}
        </ToolbarButton>
      </div>

      {/* ── Área editable de Tiptap ───────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/*
        textarea oculto que sincroniza el HTML con el FormData del formulario.
        name="content" → el Server Action lo leerá con formData.get("content").
        readOnly y tabIndex=-1 evitan que sea interactuable o accesible por teclado.
      */}
      <textarea
        name="content"
        value={html}
        onChange={() => {}}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
    </div>
  );
}

// ── Botón de la barra de herramientas ──────────────────────────────────────────

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button" // Importante: type="button" evita que el click envíe el formulario
      onClick={onClick}
      title={title}
      className={`rounded px-2.5 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-dark hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2"
      }`}
    >
      {children}
    </button>
  );
}
