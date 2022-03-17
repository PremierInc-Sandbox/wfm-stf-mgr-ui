package premierinc.wfm.aks.properties

import org.gradle.api.Action
import org.gradle.api.Project
import org.gradle.api.model.ObjectFactory
import org.gradle.api.provider.Provider
import org.gradle.api.provider.ProviderFactory
import org.gradle.kotlin.dsl.create
import org.gradle.kotlin.dsl.findByType
import org.gradle.kotlin.dsl.mapProperty
import org.gradle.kotlin.dsl.property
import javax.inject.Inject

open class BuildPropertiesExtension @Inject constructor(
    objects: ObjectFactory,
    private val providers: ProviderFactory
) {
    private val _version = objects.property<String>()

    val version: Provider<String>
        get() = _version
            .orElse(providers.gradleProperty("wfmVersion"))
            .orElse(providers.gradleProperty("version"))
            .orElse(providers.environmentVariable("WFM_VERSION"))

    val buildProperties = objects.mapProperty<String, String>()

    fun buildProperties(action: Action<in MutableMap<String, String>>) {
        val map = mutableMapOf<String,String>()
        action.execute(map)
        buildProperties.putAll(map)
    }

    companion object {
        fun Project.wfmBuildProperties(): BuildPropertiesExtension {
            return extensions.findByType() ?: extensions.create("wfmBuildProperties")
        }
    }
}
