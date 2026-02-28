/**
 * Project validation functions
 * Plain JavaScript validation without external libraries
 */

export type ProjectFormData = {
  name: string;
  description: string;
};

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; error: string };

/**
 * Validates project form data
 * @param data - The project form data to validate
 * @returns ValidationResult with validated data or error message
 */
export function validateProjectData(
  data: ProjectFormData,
): ValidationResult<ProjectFormData> {
  const name = data.name?.trim() || "";
  const description = data.description || "";

  // Name is required
  if (!name) {
    return { valid: false, error: "Project name is required" };
  }

  // Name must be 1-100 characters
  if (name.length > 100) {
    return {
      valid: false,
      error: "Project name must be less than 100 characters",
    };
  }

  // Description is optional but max 500 characters
  if (description.length > 500) {
    return {
      valid: false,
      error: "Description must be less than 500 characters",
    };
  }

  return { valid: true, data: { name, description } };
}
