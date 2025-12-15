import jsPDF from 'jspdf';
import type { DiagnosisResult, PatientData } from '../types';

interface PDFData {
  specialty: string;
  patientData: PatientData;
  symptoms: string[];
  diagnosisResult: DiagnosisResult;
  urgencyTitle: string;
  urgencyDescription: string;
  urgencyTimeframe: string;
}

export async function generateDiagnosisPDF(data: PDFData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    // Check if we need a new page
    if (yPosition + (textLines.length * lineHeight) > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(textLines, margin, yPosition);
    yPosition += textLines.length * lineHeight;
  };

  const addSpace = (space: number = lineHeight) => {
    yPosition += space;
  };

  // Header
  doc.setFillColor(79, 209, 197); // Teal color
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('Reporte de Diagnóstico Médico', margin, 25);
  doc.setFontSize(10);
  doc.text(`Especialidad: ${data.specialty}`, margin, 35);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // Fecha
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  addText(`Fecha de generación: ${currentDate}`, 9);
  addSpace(10);

  // Línea separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  addSpace(10);

  // Información del paciente
  doc.setFontSize(14);
  doc.text('INFORMACIÓN DEL PACIENTE', margin, yPosition);
  yPosition += lineHeight;
  doc.setFontSize(10);
  
  const genderText = data.patientData.gender === 'male' ? 'Masculino' : 
                     data.patientData.gender === 'female' ? 'Femenino' : 'Transgénero';
  addText(`Género: ${genderText}`);
  addText(`Rango de edad: ${data.patientData.ageRange}`);
  addText(`Síntomas reportados: ${data.symptoms.length}`);
  addSpace(10);

  // Línea separadora
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  addSpace(10);

  // Nivel de urgencia
  doc.setFontSize(14);
  doc.text('NIVEL DE URGENCIA', margin, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(12);
  addText(data.urgencyTitle);
  doc.setFontSize(10);
  addText(data.urgencyDescription);
  addText(`Tiempo recomendado de atención: ${data.urgencyTimeframe}`);
  addSpace(10);

  // Línea separadora
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  addSpace(10);

  // Análisis clínico
  doc.setFontSize(14);
  doc.text('ANÁLISIS CLÍNICO CON IA', margin, yPosition);
  yPosition += lineHeight;
  doc.setFontSize(10);
  addText(data.diagnosisResult.summary);
  addSpace(10);

  // Posibles diagnósticos
  if (data.diagnosisResult.possibleDiagnoses && data.diagnosisResult.possibleDiagnoses.length > 0) {
    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(10);
    
    doc.setFontSize(14);
    doc.text('POSIBLES DIAGNÓSTICOS', margin, yPosition);
    yPosition += lineHeight;
    doc.setFontSize(10);
    
    data.diagnosisResult.possibleDiagnoses.forEach((diagnosis, index) => {
      const probText = diagnosis.probability === 'high' ? 'Alta probabilidad' : 
                       diagnosis.probability === 'medium' ? 'Probabilidad media' : 'Baja probabilidad';
      addText(`${index + 1}. ${diagnosis.name} (${probText})`);
      addText(`   ${diagnosis.description}`, 9);
      addSpace(3);
    });
    addSpace(7);
  }

  // Señales de alarma
  if (data.diagnosisResult.redFlags && data.diagnosisResult.redFlags.length > 0) {
    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(10);
    
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red color
    doc.text('⚠ SEÑALES DE ALARMA DETECTADAS', margin, yPosition);
    yPosition += lineHeight;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    data.diagnosisResult.redFlags.forEach((flag, index) => {
      addText(`• ${flag}`);
    });
    addSpace(10);
  }

  // Acciones inmediatas
  if (data.diagnosisResult.recommendations.immediate.length > 0) {
    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(10);
    
    doc.setFontSize(14);
    doc.text('ACCIONES INMEDIATAS', margin, yPosition);
    yPosition += lineHeight;
    doc.setFontSize(10);
    
    data.diagnosisResult.recommendations.immediate.forEach((action, index) => {
      addText(`${index + 1}. ${action.title}`);
      addText(`   ${action.description}`, 9);
      if (action.priority) {
        addText(`   Prioridad: ${action.priority}`, 9);
      }
      addSpace(3);
    });
    addSpace(7);
  }

  // Cambios en el estilo de vida
  if (data.diagnosisResult.recommendations.lifestyle.length > 0) {
    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(10);
    
    doc.setFontSize(14);
    doc.text('CAMBIOS EN EL ESTILO DE VIDA', margin, yPosition);
    yPosition += lineHeight;
    doc.setFontSize(10);
    
    data.diagnosisResult.recommendations.lifestyle.forEach((action, index) => {
      addText(`${index + 1}. ${action.title}`);
      addText(`   ${action.description}`, 9);
      addSpace(3);
    });
    addSpace(7);
  }

  // Monitoreo y seguimiento
  if (data.diagnosisResult.recommendations.monitoring.length > 0) {
    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(10);
    
    doc.setFontSize(14);
    doc.text('MONITOREO Y SEGUIMIENTO', margin, yPosition);
    yPosition += lineHeight;
    doc.setFontSize(10);
    
    data.diagnosisResult.recommendations.monitoring.forEach((action, index) => {
      addText(`${index + 1}. ${action.title}`);
      addText(`   ${action.description}`, 9);
      addSpace(3);
    });
    addSpace(7);
  }

  // Próximos pasos
  if (data.diagnosisResult.nextSteps && data.diagnosisResult.nextSteps.length > 0) {
    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(10);
    
    doc.setFontSize(14);
    doc.text('PRÓXIMOS PASOS RECOMENDADOS', margin, yPosition);
    yPosition += lineHeight;
    doc.setFontSize(10);
    
    data.diagnosisResult.nextSteps.forEach((step, index) => {
      addText(`${index + 1}. ${step}`);
      addSpace(3);
    });
    addSpace(10);
  }

  // Disclaimer
  doc.setDrawColor(59, 130, 246); // Blue
  doc.setFillColor(239, 246, 255); // Light blue
  
  // Check if we need a new page for disclaimer
  if (yPosition + 30 > pageHeight - margin) {
    doc.addPage();
    yPosition = margin;
  }
  
  doc.rect(margin - 5, yPosition, pageWidth - 2 * margin + 10, 30, 'FD');
  yPosition += 10;
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175); // Dark blue
  const disclaimerText = 'AVISO IMPORTANTE: Esta evaluación es informativa y no reemplaza una consulta médica profesional. Los resultados son orientativos y basados en la información proporcionada. Siempre consulta con un profesional de la salud para un diagnóstico y tratamiento adecuado.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10);
  doc.text(disclaimerLines, margin, yPosition);

  // Save the PDF
  const fileName = `diagnostico_${data.specialty}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
