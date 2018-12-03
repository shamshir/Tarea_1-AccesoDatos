package servlets;

import generated.Configuraciones;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.RandomAccessFile;
import java.io.StringWriter;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXB;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import jaxb.JaxbClass;

public class defaultServlet extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {
            /* TODO output your page here. You may use following sample code. */
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Servlet defaultServlet</title>");
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>Servlet defaultServlet at " + request.getContextPath() + "</h1>");
            out.println("</body>");
            out.println("</html>");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        //Crear objeto File (ponerlo en f)
        ServletContext context = getServletContext();
        String fullPath = context.getRealPath("/config.xml");
        File f = new File(fullPath);

        //parsear el fichero (pasarlo a lista de Configuraciones)
        JaxbClass jaxb = new JaxbClass();
        Configuraciones configs = jaxb.xmlToObject(f);

        //Pasar a String (Marshall) nuestro objeto de configuraciones (configs)
        //marshall object to string xml
        StringWriter sw = new StringWriter();
        JAXB.marshal(configs, sw);
        String xmlString = sw.toString();

        //Expulsar text/xml
        response.setContentType("text/xml");
        PrintWriter pw = response.getWriter();
        pw.println(xmlString);

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {

            String nombre = request.getParameter("nombre");
            String modoDificil = request.getParameter("modoDificil");
            String colorNave = request.getParameter("colorNave");

            ServletContext context = getServletContext();
            String fullPath = context.getRealPath("/config.xml");
            File f = new File(fullPath);

            JaxbClass jaxb = new JaxbClass();
            Configuraciones configs = jaxb.xmlToObject(f);

            Configuraciones.Configuracion config = new Configuraciones.Configuracion();
            
            config.setNombre(nombre);
            config.setModoDificil(modoDificil);
            config.setColorNave(colorNave);
            configs.getConfiguracion().add(config);

            JAXBContext jaxbContext = JAXBContext.newInstance(Configuraciones.class);
            Marshaller jaxbMarshaller = jaxbContext.createMarshaller();

            jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);

            jaxbMarshaller.marshal(configs, f);

            response.setContentType("application/json");
            PrintWriter pw = response.getWriter();
            pw.println("{\"mess\":\"Se ha guardado correctamente\"}");

        } catch (Exception e) {

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            PrintWriter pw = response.getWriter();
            pw.println("{\"error\":\"Ha sido imposible guardar los datos\"}");

        }

    }

    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
