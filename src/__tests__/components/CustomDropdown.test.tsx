import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";

describe("<CustomDropdown /> — Menú Desplegable Animado y Accesible", () => {
  const mockOptions: DropdownOption[] = [
    { value: 1, label: "Temporada 1", badge: "10 eps" },
    { value: 2, label: "Temporada 2", badge: "12 eps" },
    { value: 3, label: "Temporada 3", badge: "8 eps" },
  ];

  it("debe renderizar el botón gatillo con la opción seleccionada", () => {
    render(
      <CustomDropdown
        label="Temporada"
        options={mockOptions}
        selectedValue={1}
        onSelect={vi.fn()}
        ariaLabel="Seleccionar temporada"
      />
    );

    const trigger = screen.getByRole("button", { name: /seleccionar temporada/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Temporada 1");
  });

  it("debe abrir el menú desplegable al hacer clic y mostrar todas las opciones", () => {
    render(
      <CustomDropdown
        label="Temporada"
        options={mockOptions}
        selectedValue={1}
        onSelect={vi.fn()}
        ariaLabel="Seleccionar temporada"
      />
    );

    const trigger = screen.getByRole("button", { name: /seleccionar temporada/i });
    fireEvent.click(trigger);

    // Deben aparecer las 3 opciones en el menú
    expect(screen.getByRole("option", { name: /temporada 1/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /temporada 2/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /temporada 3/i })).toBeInTheDocument();
  });

  it("debe llamar a onSelect al hacer clic en una opción y cerrar el menú", () => {
    const handleSelect = vi.fn();
    render(
      <CustomDropdown
        label="Temporada"
        options={mockOptions}
        selectedValue={1}
        onSelect={handleSelect}
        ariaLabel="Seleccionar temporada"
      />
    );

    const trigger = screen.getByRole("button", { name: /seleccionar temporada/i });
    fireEvent.click(trigger);

    const option2 = screen.getByRole("option", { name: /temporada 2/i });
    fireEvent.click(option2);

    expect(handleSelect).toHaveBeenCalledWith(2);
    // Tras seleccionar, el menú flotante debe cerrarse
    expect(screen.queryByRole("option", { name: /temporada 2/i })).not.toBeInTheDocument();
  });

  it("debe cerrar el menú al presionar la tecla Escape", () => {
    render(
      <CustomDropdown
        label="Temporada"
        options={mockOptions}
        selectedValue={1}
        onSelect={vi.fn()}
        ariaLabel="Seleccionar temporada"
      />
    );

    const trigger = screen.getByRole("button", { name: /seleccionar temporada/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("option", { name: /temporada 2/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("option", { name: /temporada 2/i })).not.toBeInTheDocument();
  });
});
