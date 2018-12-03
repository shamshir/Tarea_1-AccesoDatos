package servlets;

import classes.Configuracion;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.RandomAccessFile;
import java.io.StringWriter;
import java.lang.reflect.Type;
import java.util.List;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

        ServletContext context = getServletContext();
        String fullPath = context.getRealPath("/config.json");

        Gson gson = new Gson();
        
        Type listType = new TypeToken<List<Configuracion>>() {}.getType();
        
        List<Configuracion> listaConfiguraciones = gson.fromJson(new FileReader(fullPath), listType);
        
        String s = gson.toJson(listaConfiguraciones);
        response.setContentType("application/json");
        PrintWriter pw = response.getWriter();
        pw.println(s);

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {

            String nombre = request.getParameter("nombre");
            String modoDificil = request.getParameter("modoDificil");
            String colorNave = request.getParameter("colorNave");

            Configuracion config = new Configuracion();
            config.setNombre(nombre);
            config.setModoDificil(modoDificil);
            config.setColorNave(colorNave);
            
            ServletContext context = getServletContext();
            String fullPath = context.getRealPath("/config.json");

            Gson gson = new GsonBuilder()
                    .setPrettyPrinting()
                    .disableHtmlEscaping()
                    .create();
            
            Type listType = new TypeToken<List<Configuracion>>() {}.getType();
            List<Configuracion> listaConfiguraciones = gson.fromJson(new FileReader(fullPath), listType);
            
            listaConfiguraciones.add(config);
            
            FileWriter writer = new FileWriter(fullPath);
            gson.toJson(listaConfiguraciones, writer);
            writer.close();

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
