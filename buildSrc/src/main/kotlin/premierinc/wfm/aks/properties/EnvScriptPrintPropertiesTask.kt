package premierinc.wfm.aks.properties

import com.google.common.base.CaseFormat
import com.google.common.base.Splitter
import org.gradle.api.Action
import org.gradle.api.DefaultTask
import org.gradle.api.file.RegularFileProperty
import org.gradle.api.provider.MapProperty
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.OutputFile
import org.gradle.api.tasks.TaskAction
import java.io.File

abstract class EnvScriptPrintPropertiesTask : DefaultTask() {
    @get:Input
    abstract val variables: MapProperty<String,String>

    @get:OutputFile
    abstract val outputFile: RegularFileProperty

    fun variables(action: Action<in MutableMap<String, String>>) {
        val vars = mutableMapOf<String,String>()
        action.execute(vars)

        variables.set(vars.toMap())
        variables.disallowChanges()
    }

    @TaskAction
    fun run() {
        val propertyFile = outputFile.get().asFile
        propertyFile.parentFile.mkdirs()
        writePropertiesToFile(propertyFile, variables.get())
    }

    private fun writePropertiesToFile(path: File, properties: Map<String, String>) {
        val vars = properties.mapKeys { (k, _) -> transformKey(k) }
        val varsBlock = vars.map { (k, v) -> "|    $k = $v"}
        logger.lifecycle("""|======
            |Exporting variables to ${path.path}:
            ${varsBlock.joinToString("\n")}
            |======
        """.trimMargin("|"))
        path.printWriter().use { writer ->
            vars.forEach { (key, value) ->
                writer.println("export ${key}='${value}'")
            }
        }
    }

    private fun transformKey(key: String): String {
        val camelToUpperCase = CaseFormat.LOWER_CAMEL.converterTo(CaseFormat.UPPER_UNDERSCORE)
        return Splitter.on(".")
            .split(key.trim())
            .map { camelToUpperCase.convert(it) }
            .joinToString("_")
    }
}
