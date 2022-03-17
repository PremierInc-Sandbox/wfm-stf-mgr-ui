package premierinc.wfm.docker

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.Copy
import org.gradle.kotlin.dsl.*

open class StfMgrUIDockerPlugin : Plugin<Project> {
  companion object {
    const val TASK_GROUP = "release"

    fun Project.cmd(vararg args: String) {
      val result = exec {
        commandLine(*args)
        standardOutput = System.out
        isIgnoreExitValue = false
      }

      if (result.exitValue != 0) {
        result.rethrowFailure()
      }
    }
  }
  override fun apply(target: Project) = target.run {
    apply {
      plugin("com.gorylenko.gradle-git-properties")
    }

    val createDockerContext by tasks.registering(Copy::class) {
      val generateGitProperties by tasks.existing
      val buildUI by tasks.existing

      group = TASK_GROUP
      dependsOn(generateGitProperties, buildUI)

      from("Dockerfile.tpl") {
        rename { "Dockerfile" }
        expand("static_server_version" to "4.1.0-SNAPSHOT")
      }
      from(buildUI) {
        into("dist")
      }
      from(generateGitProperties)
      into(layout.buildDirectory.dir("deployment").get().asFile)
    }

    return@run
  }
}
