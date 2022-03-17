package premierinc.wfm.node

import com.github.gradle.node.npm.task.NpmInstallTask
import com.github.gradle.node.npm.task.NpmTask
import org.gradle.api.Action
import com.github.gradle.node.NodeExtension as GradleNodeExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.*

open class NodePlugin : Plugin<Project> {
  companion object {
    const val TASK_GROUP = "node"
  }

  override fun apply(project: Project) = project.run {
    apply {
      plugin("com.github.node-gradle.node")
    }
    configure<GradleNodeExtension> {
      download.set(true)
      distBaseUrl.set("https://code.premierinc.com/artifacts/repository/nodejs/")
      version.set("14.18.0")
      npmVersion.set("8.5.5")
    }

    tasks.apply {
      val npmCi by registering(NpmTask::class) {
        args.set(mutableListOf(
            "ci",
            "--registry=https://code.premierinc.com/artifacts/repository/npm/"
        ))
        execOverrides.set(Action {
          standardOutput = System.out
        })
      }

      val test by registering(NpmTask::class) {
        group = TASK_GROUP
        description = "Run frontend tests via `npm run test-headless`"
        dependsOn(npmCi)
        args.set(mutableListOf(
          "run", "test-headless"
        ))
      }

      val buildUI by registering(NpmTask::class) {
        outputs
          .dir(layout.projectDirectory.dir("dist"))
        group = TASK_GROUP
        description = "Build the UI distribution via `npm run build-cli`"
        dependsOn(npmCi, test)
        args.set(mutableListOf(
          "run", "build-cli"
        ))
      }
    }

    return@run
  }
}
